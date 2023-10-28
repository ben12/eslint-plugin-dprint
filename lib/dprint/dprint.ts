/* eslint-disable @typescript-eslint/no-var-requires */

import { createFromBuffer, Formatter } from "@dprint/formatter"
import * as fs from "fs"
import * as JSONC from "jsonc-parser"
import path from "path"

type ConfigType = string | number | boolean

interface Plugin {
    getPath?(): string
    getBuffer?(): Buffer
}

const plugins = [
    "@dprint/typescript",
    "@dprint/json",
    "@dprint/markdown",
    "@dprint/toml",
    "@dprint/dockerfile",
] as const

const formatters: Formatter[] = []

for (const module of plugins) {
    try {
        const plugin = require(module) as Plugin
        let buffer: Buffer | undefined = undefined
        if (plugin.getPath) {
            buffer = fs.readFileSync(plugin.getPath())
        } else if (plugin.getBuffer) {
            buffer = plugin.getBuffer()
        }
        if (buffer) {
            const formatter = createFromBuffer(buffer)
            formatters.push(formatter)
        }
    } catch (e) {
        // plugin unavailable
    }
}

function getFormatter(filePath: string): Formatter | undefined {
    for (const formatter of formatters) {
        const pluginInfo = formatter.getPluginInfo()
        const fileExtensions = pluginInfo.fileExtensions || []
        const fileNames = pluginInfo.fileNames || []
        const basename = path.basename(filePath)
        if (fileExtensions.some(ext => basename.endsWith("." + ext)) || fileNames.some(file => file === basename)) {
            return formatter
        }
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
): string | undefined {
    const formatter = getFormatter(filePath)
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
