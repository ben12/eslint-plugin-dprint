import { execSync } from "child_process"

export const sh = (command: string) => {
    console.log("$", command)
    execSync(command, { encoding: "utf8", stdio: "inherit" })
}

export const stdoutOf = (command: string) => {
    console.log("$", command, "> self")
    return execSync(command, {
        encoding: "utf8",
        stdio: ["inherit", "pipe", "inherit"],
    })
        .trim()
}
