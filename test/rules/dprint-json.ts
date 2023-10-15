import { RuleTester } from "eslint"
import path from "path"
import { dprintRules } from "../../lib/rules/dprint"

const tester = new RuleTester({
    parser: require.resolve("@ben_12/eslint-simple-parser"),
})
tester.run("dprint/json", dprintRules.json, {
    valid: [
        {
            filename: path.join(__dirname, "test.json"),
            code: '{ "hello": "world" } // comment\n',
            options: [{ configFile: "", config: {} }],
        }, // With dprint JSON configuration
        {
            filename: path.join(__dirname, "test.json"),
            code: '{ "hello": "world" } //comment\n',
            options: [{ configFile: "test/dprint.json", config: {} }],
        }, // Non json file
        {
            filename: path.join(__dirname, "test.js"),
            code: "",
            options: [{ configFile: "", config: {} }],
        },
    ],
    invalid: [],
})
