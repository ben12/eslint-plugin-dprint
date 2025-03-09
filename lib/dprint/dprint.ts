/* eslint-disable @typescript-eslint/no-require-imports */

import { createFromBuffer, FormatRequest, Formatter } from "@dprint/formatter"
import * as fs from "fs"
import * as JSONC from "jsonc-parser"
import path from "path"

type ConfigType = string | number | boolean

interface Plugin {
    getPath?(): string
    getBuffer?(): Buffer
}

function loadPlugin(module: string): Buffer | undefined {
    let plugin: Plugin | undefined = undefined
    try {
        plugin = require(module) as Plugin
    } catch (_) {
        // plugin unavailable
    }
    if (plugin?.getPath) {
        return fs.readFileSync(plugin.getPath())
    } else if (plugin?.getBuffer) {
        return plugin.getBuffer()
    }
    return undefined
}

function loadWasm(module: string, wasmFile: string): Buffer | undefined {
    let wasmPath: string | undefined = undefined
    try {
        wasmPath = require.resolve([module, wasmFile].filter(s => s?.length).join("/"))
    } catch (_) {
        // plugin unavailable
    }
    if (wasmPath?.length) {
        return fs.readFileSync(wasmPath)
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
} as const

const plugins: Readonly<Record<string, () => Buffer | undefined>> = {
    "typescript": () => loadPlugin(pluginsName["typescript"]),
    "json": () => loadPlugin(pluginsName["json"]),
    "markdown": () => loadPlugin(pluginsName["markdown"]),
    "toml": () => loadPlugin(pluginsName["toml"]),
    "dockerfile": () => loadPlugin(pluginsName["dockerfile"]),
    "malva": () => loadWasm(pluginsName["malva"], "plugin.wasm"),
    "markup": () => loadWasm(pluginsName["markup"], "plugin.wasm"),
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

/** Cache to reduce copies of config values. */
const lastConfigFile: { [key: string]: string | undefined } = {}

function getFormatter(filePath: string, configName: string, configFile: string): Formatter | undefined {
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
        if (fileExtensions.some(ext => basename.endsWith("." + ext)) || fileNames.some(file => file === basename)) {
            return formatter
        } else if (isPluginName(configName)) {
            console.warn("File %s not supported by %s", filePath, pluginsName[configName])
        }
    } else if (isPluginName(configName)) {
        console.error("Plugin not found: %s", pluginsName[configName])
    } else {
        console.error("Unknown plugin for %s", configName)
    }
    return undefined
}

/**
 * Format the given text with the given config.
 * @param config The config object.
 * @param filePath The path to the file.
 * @param fileText The content of the file.
 * @returns The formatted text or undefined. It's undefined if the formatter doesn't change the text.
 */
export function format(
    configFile: string,
    overrideConfig: Record<string, unknown>,
    filePath: string,
    fileText: string,
    configName: string,
): string | undefined {
    const formatter = getFormatter(filePath, configName, configFile)
    if (formatter) {
        const request: FormatRequest = {
            filePath,
            fileText,
            overrideConfig,
        }
        return formatter.formatText(request)
    }
    return undefined
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
