import fs from "fs"
import https from "https"
import path from "path"
import { sh, stdoutOf } from "./lib/utils"

const RootPath = path.resolve(__dirname, "..")
const LibDprintPath = path.join(RootPath, "lib/dprint")
const ConfigSchemaPath = path.join(LibDprintPath, "config-schema.json")

type CurrentVersionInfo = {
    version: string
}
type LatestReleaseInfo = {
    configSchemaPath: string
    version: string
}

/**
 * Read the current version information.
 */
function readCurrentVersion(): CurrentVersionInfo {
    return { version: stdoutOf("npm ls --depth=0 | grep @dprint/typescript | sed -E 's/.*?@([^@]+)$/\\1/g'") }
}

/**
 * Read the latest release information.
 * It's came from `https://github.com/dprint/dprint-plugin-typescript` repository.
 */
function readLatestVersion(): LatestReleaseInfo {
    const version = stdoutOf("npm view @dprint/typescript version")
    if (version.matchAll(/\d+\.\d+\.\d+/g)) {
        const schema =
            `https://raw.githubusercontent.com/dprint/dprint-plugin-typescript/${version}/deployment/schema.json`
        return {
            version: version,
            configSchemaPath: schema,
        }
    }

    throw new Error(`Stable release was not found !`)
}

/**
 * Update the config schema.
 * This function modifies it to adjust JSON Schema v4.
 * @param srcPath The path to the source code of the config schema.
 */
async function updateConfigSchema(srcPath: string): Promise<void> {
    console.log("Update %o", path.relative(process.cwd(), ConfigSchemaPath))

    const originalContent = await new Promise<string>((resolve, fail) =>
        https.get(srcPath, response => {
            let body = ""
            response.setEncoding("utf-8")
            const stream = response.on("data", chunk => body += chunk)
            stream.on("end", () => resolve(body))
        })
            .on("error", () => fail())
    )
    const modifiedContent = originalContent
        .replace(/"\$schema":.+?\n\s*"\$id":.+?\n\s*/u, "")
        .replace(/"const": ([^,\n]+)/gu, '"enum": [$1]')

    fs.writeFileSync(ConfigSchemaPath, modifiedContent)
}

/**
 * Calculate the update kind between two given versions.
 * That's one of `major`, `minor`, and `patch`.
 * @param version1 A version text to compare.
 * @param version2 Another vresion text to compare.
 */
function calculateUpdateKind(version1: string, version2: string): string {
    const [major1, minor1] = version1.split(".")
    const [major2, minor2] = version2.split(".")

    if (major1 !== major2) {
        return "major"
    }
    if (minor1 !== minor2) {
        return "minor"
    }
    return "patch"
}

/**
 * Main logic.
 */
async function main(): Promise<string> {
    const current = await readCurrentVersion()
    const latest = await readLatestVersion()

    if (latest.version === current.version) {
        console.log(
            "The current version is %o; no update found.",
            current.version,
        )
        return "none"
    }
    console.log(
        "The current version is %o, the latest release is %o; need to upgrade that.",
        current.version,
        latest.version,
    )

    await updateConfigSchema(latest.configSchemaPath)
    sh(`npm install @dprint/typescript@^${latest.version}`)
    return calculateUpdateKind(current.version, latest.version)
}

main()
    .catch(error => {
        console.error(error)
        process.exitCode = 1
        return "none"
    })
    .then(updateKind => {
        const updated = updateKind === "major" ||
            updateKind === "minor" ||
            updateKind === "patch"

        if (process.env.GITHUB_OUTPUT) {
            fs.writeFileSync(
                process.env.GITHUB_OUTPUT,
                `updated=${updated ? "yes" : "no"}
kind=${updateKind}`,
            )
        }
    })
