import { version as rawVersion } from "../package.json"
import { sh, stdoutOf } from "./lib/utils"

// ------------------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------------------

// ------------------------------------------------------------------------------
// Constants
// ------------------------------------------------------------------------------

const branch = stdoutOf("git symbolic-ref --short HEAD")
const version = branch === "master" ? rawVersion : `${rawVersion}-${branch}`
const sha1 = stdoutOf('git log -1 --format="%h"')
const commitMessage = `🔖 v${version} (built with ${sha1})`

// ------------------------------------------------------------------------------
// Main
// ------------------------------------------------------------------------------

// Commit new version
sh("git add .")
sh(`git commit -m "${commitMessage}"`)

// Create the tag
sh(`git tag "v${version}"`)

// push it
sh(`git push`)
sh(`git push origin "v${version}"`)
