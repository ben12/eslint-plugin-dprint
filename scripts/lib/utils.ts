import { execSync } from "child_process"
import { writeFileSync } from "fs"

export const sh = (command: string) => {
    console.log("$", command)
    execSync(command, { encoding: "utf8", stdio: "inherit" })
}

export const stdoutOf = (command: string) => {
    console.log("$", command, "> self")
    return execSync(command, {
        encoding: "utf8",
        stdio: ["inherit", "pipe"],
        shell: "bash",
    })
        .trim()
}

export const setGithubOutput = (varName: string, value: string) => {
    if (process.env.GITHUB_OUTPUT) {
        writeFileSync(
            process.env.GITHUB_OUTPUT,
            `${varName}=${value}\n`,
            { flag: "a+" },
        )
    }
}
