import dprint from "@dprint/typescript"
import createDebug from "debug"
import fs from "fs"
import * as JSONC from "jsonc-parser"

const debug = createDebug("eslint:plugin-dprint")

type ConfigType = string | number | boolean

// eslint-disable-next-line no-shadow -- I'm not sure why, but `@types/node` doesn't contain WebAssembly in spite of it has been supported since 8.0.0.
declare let WebAssembly: any

// Load `dprint-plugin-typescript`.
const TSPluginPath = dprint.getPath()
const TSPluginModule = new WebAssembly.Module(fs.readFileSync(TSPluginPath))
const TSPluginInstance = new WebAssembly.Instance(TSPluginModule, {})
const TSPlugin = TSPluginInstance.exports
const BufferSize = TSPlugin.get_wasm_memory_buffer_size()

/** Cache to reduce copies of config values. */
let lastConfig: string | undefined
let lastConfigFile: string | undefined

/**
 * Format the given text with the given config.
 * @param config The config object.
 * @param filePath The path to the file.
 * @param fileText The content of the file.
 * @returns The formatted text or undefined. It's undefined if the formatter doesn't change the text.
 */
export function format(
    configFile: string,
    config: Record<string, any>,
    filePath: string,
    fileText: string,
): string | undefined {
    if (JSON.stringify(config) !== lastConfig || configFile !== lastConfigFile) {
        lastConfig = JSON.stringify(config)
        lastConfigFile = configFile
        writeConfig(configFile, config)
    }
    writeFilePath(filePath)

    writeString(fileText)
    const retv = TSPlugin.format()

    switch (retv) {
        case 0: // no change
            return undefined
        case 1: // change
            return readFormattedText()
        case 2: // error
            debug("FAILED TO FORMAT: %s", readErrorText())
            return undefined
        default:
            debug("FAILED TO FORMAT: Unknown response code (%d)", retv)
            return undefined
    }
}

function isConfigAllowedType(value: unknown): value is ConfigType {
    return ["string", "number", "boolean"].includes(typeof value)
}

function extractConfig(config: any, toConfig: Record<string, any>) {
    for (const [key, value] of Object.entries(config)) {
        if (isConfigAllowedType(value)) {
            toConfig[key] = value
        }
    }
}

/**
 * Write the config to the plugin.
 * @param config The config object.
 */
function writeConfig(configFile: string, config: Record<string, any>): void {
    TSPlugin.reset_config()

    // The setting values must be strings.
    const globalConfig: Record<string, ConfigType> = {}
    const pluginConfig: Record<string, ConfigType> = {}

    if (configFile?.length && fs.existsSync(configFile)) {
        const configFileContent = fs.readFileSync(configFile, { encoding: "utf-8" })
        const configFileJson = JSONC.parse(configFileContent)
        extractConfig(configFileJson, globalConfig)

        const typescriptConfig = configFileJson.typescript
        if (typeof typescriptConfig === "object") {
            extractConfig(typescriptConfig, pluginConfig)
        }
    }

    extractConfig(config, pluginConfig)

    writeString(JSON.stringify(globalConfig))
    TSPlugin.set_global_config()
    writeString(JSON.stringify(pluginConfig))
    TSPlugin.set_plugin_config()
}

/**
 * Write the file path to the plugin.
 * @param value The path to the file.
 */
function writeFilePath(value: string): void {
    writeString(value)
    TSPlugin.set_file_path()
}

/**
 * Read the text that the last `TSPlugin.format()` call formatted.
 * @returns The formatted text.
 */
function readFormattedText(): string {
    return readString(TSPlugin.get_formatted_text())
}

/**
 * Read the error message that the last `TSPlugin.format()` call caused.
 * @returns The error message.
 */
function readErrorText(): string {
    return readString(TSPlugin.get_error_text())
}

/**
 * Write a string to the plugin.
 * @param text The text to write.
 */
function writeString(text: string): void {
    const buffer = Buffer.from(text, "utf8")
    const length = buffer.byteLength

    TSPlugin.clear_shared_bytes(length)

    let index = 0
    while (index < length) {
        const writeCount = Math.min(length - index, BufferSize)

        buffer.copy(
            new Uint8Array(
                TSPlugin
                    .memory
                    .buffer,
                TSPlugin.get_wasm_memory_buffer(),
                writeCount,
            ),
            0,
            index,
            index + writeCount,
        )
        TSPlugin.add_to_shared_bytes_from_buffer(writeCount)

        index += writeCount
    }
}

/**
 * Read a text from the plugin.
 * @param length The byte length of the string.
 * @returns The read text.
 */
function readString(length: number): string {
    const buffer = Buffer.allocUnsafe(length)

    let index = 0
    while (index < length) {
        const readCount = Math.min(length - index, BufferSize)
        TSPlugin.set_buffer_with_shared_bytes(index, readCount)

        buffer.set(
            new Uint8Array(
                TSPlugin
                    .memory
                    .buffer,
                TSPlugin.get_wasm_memory_buffer(),
                readCount,
            ),
            index,
        )

        index += readCount
    }

    return buffer.toString("utf8")
}
