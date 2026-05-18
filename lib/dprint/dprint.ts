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

/**
 * Caller-provided formatter, accepted alongside (or instead of) the configFile/config options.
 *
 * Supported shapes:
 *  - `{ getPath(): string }` — matches `@dprint/typescript`, `@dprint/json`, etc.
 *  - `{ getBuffer(): BufferSource }` — matches `dprint-plugin-yaml`, `dprint-plugin-markup`, etc.
 *  - raw wasm bytes (`Buffer` / `Uint8Array` / `ArrayBuffer`)
 *  - a pre-built `Formatter` from `@dprint/formatter`'s `createFromBuffer`
 */
export type FormatterInput =
    | { getPath(): string }
    | { getBuffer(): BufferSource }
    | BufferSource
    | Formatter

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

function isBufferSource(value: unknown): value is BufferSource {
    return value instanceof ArrayBuffer || ArrayBuffer.isView(value as ArrayBufferView)
}

function isFormatter(value: unknown): value is Formatter {
    return typeof value === "object" && value !== null &&
        typeof (value as Formatter).formatText === "function" &&
        typeof (value as Formatter).getPluginInfo === "function" &&
        typeof (value as Formatter).setConfig === "function"
}

/** Cache of resolved Formatters keyed by the caller-provided FormatterInput identity. */
const resolvedFormatters = new WeakMap<object, Formatter>()

function resolveFormatterInput(input: FormatterInput): Formatter {
    const cached = resolvedFormatters.get(input as object)
    if (cached) {
        return cached
    }
    let formatter: Formatter
    if (isFormatter(input)) {
        formatter = input
    } else if (isBufferSource(input)) {
        formatter = createFromBuffer(input)
    } else if (typeof (input as { getPath?: () => string }).getPath === "function") {
        formatter = createFromBuffer(Buffer.from(fs.readFileSync((input as { getPath: () => string }).getPath())))
    } else if (typeof (input as { getBuffer?: () => BufferSource }).getBuffer === "function") {
        formatter = createFromBuffer((input as { getBuffer: () => BufferSource }).getBuffer())
    } else {
        throw new TypeError(
            "Invalid `formatter` option: expected a Formatter, BufferSource, " +
                "or an object with getPath()/getBuffer().",
        )
    }
    resolvedFormatters.set(input as object, formatter)
    return formatter
}

/** Cache of the last configFile applied to a given Formatter, to avoid redundant setConfig calls. */
const lastConfigFileByFormatter = new WeakMap<Formatter, string>()

function applyConfigIfNeeded(formatter: Formatter, configFile: string): void {
    if (lastConfigFileByFormatter.get(formatter) !== configFile) {
        lastConfigFileByFormatter.set(formatter, configFile)
        const configKey = formatter.getPluginInfo().configKey
        setConfig(formatter, configKey, configFile)
    }
}

function getFormatter(
    filePath: string,
    configName: string,
    configFile: string,
    log: boolean,
    formatterInput: FormatterInput | undefined,
): Formatter | undefined {
    const formatter = formatterInput !== undefined
        ? resolveFormatterInput(formatterInput)
        : formatters[configName]
    if (formatter) {
        applyConfigIfNeeded(formatter, configFile)
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
        const formatter = getFormatter(filePath, configName, configFile, false, undefined)
        if (formatter) {
            return [configFile, formatter] as const
        }
    }
    return [] as const
}

/**
 * Format the given text with the given config.
 * @param config The config object.
 * @param filePath The path to the file.
 * @param fileText The content of the file.
 * @param formatterInput Optional pre-resolved dprint formatter (or its source) to use instead of the
 *   module-level plugin lookup. When supplied, the global formatter table is bypassed and no
 *   "Plugin not found" warning is logged.
 * @returns The formatted text or undefined. It's undefined if the formatter doesn't change the text.
 */
export function format(
    configFile: string,
    overrideConfig: Record<string, unknown>,
    filePath: string,
    fileText: string,
    configName: string,
    formatterInput?: FormatterInput,
): string {
    const formatter = getFormatter(filePath, configName, configFile, true, formatterInput)
    if (formatter) {
        const request: FormatRequest = {
            filePath,
            fileText,
            overrideConfig,
        }
        return formatter.formatText(
            request,
            hostRequest => formatWithHost(hostRequest, configFile, configName),
        )
    }
    return fileText
}

export function formatWithHost(
    request: FormatRequest,
    configFile: string,
    fromConfigName: string,
): string {
    const [configName, formatter] = getFormatterByExt(request.filePath, configFile, fromConfigName)
    if (configName && formatter) {
        return formatter.formatText(
            request,
            hostRequest => formatWithHost(hostRequest, configFile, configName),
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
