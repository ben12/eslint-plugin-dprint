import { RuleTester } from "eslint"
import path from "path"
import { dprintRules } from "../../lib/rules/dprint"

const tester = new RuleTester({
    parser: path.join(__dirname, "../../lib/simple-parser"),
})
tester.run("dprint/toml", dprintRules.toml, {
    valid: [
        {
            filename: path.join(__dirname, "test.toml"),
            code: '[hello]\nwho = "World" # comment\n',
            options: [{ configFile: "", config: {} }],
        }, // With dprint json configuration
        {
            filename: path.join(__dirname, "test.toml"),
            code: '[hello]\nwho = "World" #comment\n',
            options: [{ configFile: "test/dprint.json", config: {} }],
        }, // Non toml file
        {
            filename: path.join(__dirname, "test.js"),
            code: "",
            options: [{ configFile: "", config: {} }],
        },
    ],
    invalid: [],
})
