/* eslint-disable @typescript-eslint/no-require-imports */

import { createFromBuffer, Formatter } from "@dprint/formatter"
import * as fs from "fs"
import * as JSONC from "jsonc-parser"
import path from "path"

type ConfigType = string | number | boolean

interface Plugin {
    getPath?(): string
    getBuffer?(): Buffer
}

const plugins: Readonly<Record<string, string>> = {
    "typescript": "@dprint/typescript",
    "json": "@dprint/json",
    "markdown": "@dprint/markdown",
    "toml": "@dprint/toml",
    "dockerfile": "@dprint/dockerfile",
    "malva": "dprint-plugin-malva",
}

const formatters: Readonly<Record<string, Formatter>> = Object.entries(plugins).reduce(
    (formatters, [name, module]) => {
        try {
            let packageJson
            try {
                packageJson = require(module + "/package.json")
            } // eslint-disable-next-line @typescript-eslint/no-unused-vars
            catch (e) {
                // plugin unavailable
                return formatters
            }
            let buffer: Buffer | undefined = undefined
            if (packageJson.main?.endsWith(".js")) {
                const plugin = require(module) as Plugin
                if (plugin.getPath) {
                    buffer = fs.readFileSync(plugin.getPath())
                } else if (plugin.getBuffer) {
                    buffer = plugin.getBuffer()
                }
            } else if (packageJson.exports?.["."]?.endsWith(".wasm")) {
                buffer = fs.readFileSync(require.resolve(module))
            }
            if (buffer) {
                const formatter = createFromBuffer(buffer)
                formatters[name] = formatter
            }
        } catch (e) {
            console.error("Fail to load plugin", module, ":", e)
            // plugin unavailable
        }
        return formatters
    },
    {} as Record<string, Formatter>,
)

function getFormatter(filePath: string, configName: string): Formatter | undefined {
    const formatter = formatters[configName]
    if (formatter) {
        const pluginInfo = formatter.getPluginInfo()
        const fileExtensions = pluginInfo.fileExtensions || []
        const fileNames = pluginInfo.fileNames || []
        const basename = path.basename(filePath)
        if (fileExtensions.some(ext => basename.endsWith("." + ext)) || fileNames.some(file => file === basename)) {
            return formatter
        } else {
            console.warn("File %s not supported by %s", filePath, plugins[configName])
        }
    } else if (plugins[configName]) {
        console.error("Plugin not found: %s", plugins[configName])
    } else {
        console.error("Unknown plugin for %s", configName)
    }
    return undefined
}

/** Cache to reduce copies of config values. */
const lastConfig: { [key: string]: string | undefined } = {}
const lastConfigFile: { [key: string]: string | undefined } = {}

/**
 * Format the given text with the given config.
 * @param config The config object.
 * @param filePath The path to the file.
 * @param fileText The content of the file.
 * @returns The formatted text or undefined. It's undefined if the formatter doesn't change the text.
 */
export function format(
    configFile: string,
    config: Record<string, unknown>,
    filePath: string,
    fileText: string,
    configName: string,
): string | undefined {
    const formatter = getFormatter(filePath, configName)
    if (formatter) {
        const configKey = formatter.getPluginInfo().configKey
        const newConfig = JSON.stringify(config)
        if (newConfig !== lastConfig[configKey] || configFile !== lastConfigFile[configKey]) {
            lastConfig[configKey] = newConfig
            lastConfigFile[configKey] = configFile
            setConfig(formatter, configKey, configFile, config)
        }

        return formatter.formatText(filePath, fileText)
    }

    return undefined
}

function setConfig(formatter: Formatter, configKey: string, configFile: string, config: Record<string, unknown>): void {
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

    extractConfig(config, pluginConfig)

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
