import axios from "axios"
import fs from "fs"
import * as JSONC from "jsonc-parser"
import path from "path"
import { setGithubOutput, sh, stdoutOf } from "./lib/utils"

const RootPath = path.resolve(__dirname, "..")
const LibDprintPath = path.join(RootPath, "lib/dprint")

enum UpdateKing {
    major,
    minor,
    patch,
    none,
}

interface PluginConfig {
    name: string
    schema: (version: string) => { source: string; destination: string }
}

function createPluginConfig(
    shortName: string,
    org: string = "dprint",
    plugin: string = `dprint-plugin-${shortName}`,
    npmMame: string = `@dprint/${shortName}`,
    versionPrefix: string = "",
): PluginConfig {
    return {
        name: npmMame,
        schema: (version: string) => ({
            source: `https://plugins.dprint.dev/${org}/${plugin}/${versionPrefix}${version}/schema.json`,
            destination: path.join(LibDprintPath, `${shortName}-config-schema.json`),
        }),
    }
}

const plugins: PluginConfig[] = [
    createPluginConfig("dockerfile"),
    createPluginConfig("json"),
    createPluginConfig("markdown"),
    createPluginConfig("toml"),
    createPluginConfig("typescript"),
    createPluginConfig("malva", "g-plane", "malva", "dprint-plugin-malva", "v"),
    createPluginConfig("markup", "g-plane", "markup_fmt", "dprint-plugin-markup", "v"),
    createPluginConfig("yaml", "g-plane", "pretty_yaml", "dprint-plugin-yaml", "v"),
    createPluginConfig("graphql", "g-plane", "pretty_graphql", "dprint-plugin-graphql", "v"),
]

type CurrentVersionInfo = {
    version: string
}
type LatestReleaseInfo = {
    configSchemaPath: string
    configSchemaDest: string
    version: string
}

/**
 * Read the current version information.
 */
function readCurrentVersion(plugin: PluginConfig): CurrentVersionInfo {
    return { version: stdoutOf(`npm ls --depth=0 | grep ${plugin.name} | sed -E 's/.*?@\\^?([^@]+)$/\\1/g'`) }
}

/**
 * Read the latest release information.
 * It's came from `https://github.com/dprint/dprint-plugin-typescript` repository.
 */
function readLatestVersion(plugin: PluginConfig): LatestReleaseInfo {
    const version = stdoutOf(`npm view ${plugin.name} version`)
    if (version.matchAll(/\d+\.\d+\.\d+/g)) {
        const schema = plugin.schema(version)
        return {
            version: version,
            configSchemaPath: schema.source,
            configSchemaDest: schema.destination,
        }
    }

    throw new Error(`Stable release was not found !`)
}

/**
 * Update the config schema.
 * This function modifies it to adjust JSON Schema v4.
 * @param srcPath The path to the source code of the config schema.
 */
async function updateConfigSchema(srcPath: string, destPath: string): Promise<void> {
    console.log("Update %o => %o", srcPath, path.relative(process.cwd(), destPath))

    const originalContent = await new Promise<string>((resolve, fail) =>
        axios({
            url: srcPath,
            responseType: "text",
            method: "get",
        }).then(response => resolve(response.data))
            .catch(err => fail(new Error(err?.message ?? err?.response?.status)))
    )

    const jsonSchema = JSONC.parse(originalContent)
    fixConfigSchema(jsonSchema)

    fs.writeFileSync(destPath, JSON.stringify(jsonSchema, undefined, 2))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Safe use of any for JSON structure
function fixConfigSchema(jsonSchema: any) {
    if (jsonSchema !== null && typeof jsonSchema === "object") {
        Object.entries(jsonSchema).forEach(([key, value]) => {
            if (["$schema", "$id", "default"].includes(key)) {
                // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                delete jsonSchema[key]
            } else if ("const" === key) {
                // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                delete jsonSchema[key]
                jsonSchema["type"] = typeof value
                value = [value]
                jsonSchema["enum"] = value
            } else {
                fixConfigSchema(value)
            }
        })
        // "$ref" is always alone
        if ("$ref" in jsonSchema) {
            for (const key of Object.keys(jsonSchema)) {
                if (key !== "$ref") {
                    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                    delete jsonSchema[key]
                }
            }
        }
    } else if (Array.isArray(jsonSchema)) {
        jsonSchema.forEach(value => fixConfigSchema(value))
    }
}

/**
 * Calculate the update kind between two given versions.
 * That's one of `major`, `minor`, and `patch`.
 * @param version1 A version text to compare.
 * @param version2 Another vresion text to compare.
 */
function calculateUpdateKind(version1: string, version2: string): UpdateKing {
    const [major1, minor1] = version1.split(".")
    const [major2, minor2] = version2.split(".")

    if (major1 !== major2) {
        return UpdateKing.major
    }
    if (minor1 !== minor2) {
        return UpdateKing.minor
    }
    return UpdateKing.patch
}

/**
 * Main logic.
 */
async function main(): Promise<UpdateKing> {
    let kind = UpdateKing.none
    const updates = []
    for (const plugin of plugins) {
        const current = readCurrentVersion(plugin)
        const latest = readLatestVersion(plugin)

        if (latest.version === current.version) {
            console.log(
                "The current version is %o; no update found.",
                current.version,
            )
            continue
        }
        console.log(
            "The current version is %o, the latest release is %o; need to upgrade that.",
            current.version,
            latest.version,
        )

        await updateConfigSchema(latest.configSchemaPath, latest.configSchemaDest)
        sh(`npm install --save-peer ${plugin.name}@^${latest.version}`)

        const pKind = calculateUpdateKind(current.version, latest.version)
        kind = Math.min(kind, pKind)

        if (pKind !== UpdateKing.none) {
            updates.push(`${plugin.name} to v${latest.version}`)
        }
    }

    setGithubOutput("dprint_plugin_updates", updates.join(", "))

    return kind
}

main()
    .catch(error => {
        console.error(error)
        process.exitCode = 1
        return UpdateKing.none
    })
    .then(updateKind => {
        const updated = updateKind !== UpdateKing.none

        setGithubOutput("updated", updated ? "yes" : "no")
        setGithubOutput("kind", UpdateKing[updateKind])
    })
