/* eslint-disable @typescript-eslint/no-require-imports */

import { createFromBuffer, FormatRequest, Formatter } from "@dprint/formatter"
import * as JSONC from "jsonc-parser"
import * as fs from "node:fs"
import path from "node:path"

type ConfigType = string | number | boolean

interface Plugin {
    getPath?(): string
    getBuffer?(): BufferSource
}

function loadPlugin(module: string): BufferSource | undefined {
    let plugin: Plugin | undefined = undefined
    try {
        plugin = require(module) as Plugin
    } catch (_) {
        // plugin unavailable
    }
    if (plugin?.getPath) {
        return Buffer.from(fs.readFileSync(plugin.getPath()))
    } else if (plugin?.getBuffer) {
        return plugin.getBuffer()
    }
    return undefined
}

function loadWasm(module: string, wasmFile: string): BufferSource | undefined {
    let wasmPath: string | undefined = undefined
    try {
        wasmPath = require.resolve([module, wasmFile].filter(s => s?.length).join("/"))
    } catch (_) {
        // plugin unavailable
    }
    if (wasmPath?.length) {
        return Buffer.from(fs.readFileSync(wasmPath))
    }
    return undefined
}

const pluginsName = {
    "typescript": "@dprint/typescript",
    "json": "@dprint/json",
    "markdown": "@dprint/markdown",
    "toml": "@dprint/toml",
    "dockerfile": "@dprint/dockerfile",
    "malva": "dprint-plugin-malva",
    "markup": "dprint-plugin-markup",
    "yaml": "dprint-plugin-yaml",
    "graphql": "dprint-plugin-graphql",
} as const

const plugins: Readonly<Record<string, () => BufferSource | undefined>> = {
    "typescript": () => loadPlugin(pluginsName["typescript"]),
    "json": () => loadPlugin(pluginsName["json"]),
    "markdown": () => loadPlugin(pluginsName["markdown"]),
    "toml": () => loadPlugin(pluginsName["toml"]),
    "dockerfile": () => loadPlugin(pluginsName["dockerfile"]),
    "malva": () => loadWasm(pluginsName["malva"], "plugin.wasm"),
    "markup": () => loadWasm(pluginsName["markup"], "plugin.wasm"),
    "yaml": () => loadWasm(pluginsName["yaml"], "plugin.wasm"),
    "graphql": () => loadWasm(pluginsName["graphql"], "plugin.wasm"),
}

function isPluginName(name: string): name is keyof typeof pluginsName {
    return name in pluginsName
}

const formatters: Readonly<Record<string, Formatter>> = Object.entries(plugins).reduce(
    (formatters, [name, getBuffer]) => {
        try {
            const buffer = getBuffer()
            if (buffer) {
                const formatter = createFromBuffer(buffer)
                formatters[name] = formatter
            }
        } catch (e) {
            console.error("Fail to load plugin", module, ":", e)
        }
        return formatters
    },
    {} as Record<string, Formatter>,
)

const lastConfigFile: { [key: string]: string | undefined } = {}

function getFormatter(
    filePath: string,
    configName: string,
    configFile: string,
    log = true,
): Formatter | undefined {
    const formatter = formatters[configName]
    if (formatter) {
        const configKey = formatter.getPluginInfo().configKey
        if (configFile !== lastConfigFile[configKey]) {
            lastConfigFile[configKey] = configFile
            setConfig(formatter, configKey, configFile)
        }
        const fileMatchingInfo = formatter.getFileMatchingInfo()
        const fileExtensions = fileMatchingInfo.fileExtensions || []
        const fileNames = fileMatchingInfo.fileNames || []
        const basename = path.basename(filePath)
        if (fileExtensions.some(ext => basename.endsWith("." + ext)) || fileNames.includes(basename)) {
            return formatter
        } else if (isPluginName(configName) && log) {
            console.warn("File %s not supported by %s", filePath, pluginsName[configName])
        }
    } else if (isPluginName(configName) && log) {
        console.error("Plugin not found: %s", pluginsName[configName])
    } else if (log) {
        console.error("Unknown plugin for %s", configName)
    }
    return undefined
}

function getFormatterByExt(filePath: string, configFile: string, exclude: string) {
    const configNames = Object.keys(formatters).filter(name => name !== exclude)
    for (const configName of configNames) {
        const formatter = getFormatter(filePath, configName, configFile, false)
        if (formatter) {
            return [configName, formatter] as const
        }
    }
    return [] as const
}

/**
 * Format the given text with the given config.
 * @param configFile Path to a dprint configuration file (or empty string for none).
 * @param overrideConfig Inline config for the originating plugin (applied per-call via FormatRequest.overrideConfig).
 * @param hostConfigs Per-sibling-plugin config. Merged into FormatRequest.overrideConfig on each
 *   delegated call when the originating plugin invokes a sibling via the host callback
 *   (e.g. fenced code blocks inside markdown). Keys are plugin names ("typescript", "json", ...).
 *   Without this, host-invoked plugins fall back to the on-disk configFile only.
 * @param filePath The path to the file.
 * @param fileText The content of the file.
 * @param configName The plugin name of the originating formatter.
 * @returns The formatted text. Returns the input fileText if no formatter applies.
 */
export function format(
    configFile: string,
    overrideConfig: Record<string, unknown>,
    hostConfigs: Record<string, Record<string, unknown>>,
    filePath: string,
    fileText: string,
    configName: string,
): string {
    const formatter = getFormatter(filePath, configName, configFile)
    if (formatter) {
        const request: FormatRequest = {
            filePath,
            fileText,
            overrideConfig,
        }
        return formatter.formatText(
            request,
            hostRequest => formatWithHost(hostRequest, configFile, hostConfigs, configName),
        )
    }
    return fileText
}

export function formatWithHost(
    request: FormatRequest,
    configFile: string,
    hostConfigs: Record<string, Record<string, unknown>>,
    fromConfigName: string,
): string {
    const [configName, formatter] = getFormatterByExt(request.filePath, configFile, fromConfigName)
    if (configName && formatter) {
        const hostConfig = hostConfigs[configName]
        if (hostConfig && typeof hostConfig === "object") {
            const overrideConfig: Record<string, unknown> = { ...request.overrideConfig }
            extractConfig(hostConfig, overrideConfig)
            request = { ...request, overrideConfig }
        }
        return formatter.formatText(
            request,
            hostRequest => formatWithHost(hostRequest, configFile, hostConfigs, configName),
        )
    }
    return request.fileText
}

function setConfig(formatter: Formatter, configKey: string, configFile: string): void {
    // The setting values must be strings.
    const globalConfig: Record<string, ConfigType> = {}
    const pluginConfig: Record<string, ConfigType> = {}

    if (configFile.length && fs.existsSync(configFile)) {
        const configFileContent = fs.readFileSync(configFile, { encoding: "utf-8" })
        const configFileJson = JSONC.parse(configFileContent)
        extractConfig(configFileJson, globalConfig)

        const pluginConfigFileJson = configFileJson[configKey]
        if (typeof pluginConfigFileJson === "object") {
            extractConfig(pluginConfigFileJson, pluginConfig)
        }
    }

    formatter.setConfig(globalConfig, pluginConfig)
}

function isConfigAllowedType(value: unknown): value is ConfigType {
    return ["string", "number", "boolean"].includes(typeof value)
}

function extractConfig(config: object, toConfig: Record<string, unknown>) {
    for (const [key, value] of Object.entries(config)) {
        if (isConfigAllowedType(value)) {
            toConfig[key] = value
        }
    }
}
