import { RuleTester } from "eslint"
import path from "path"
import { dprintRules } from "../../lib/rules/dprint"

const tester = new RuleTester({
    parser: require.resolve("@ben_12/eslint-simple-parser"),
})
tester.run("dprint/dockerfile", dprintRules.dockerfile, {
    valid: [
        {
            filename: path.join(__dirname, "Dockerfile"),
            code: "FROM ubuntu:latest\n",
            options: [{ configFile: "", config: {} }],
        }, // With dprint JSON configuration
        {
            filename: path.join(__dirname, "test.dockerfile"),
            code: "FROM ubuntu:latest\r\n",
            options: [{ configFile: "test/dprint.json", config: {} }],
        }, // Non dockerfile file
        {
            filename: path.join(__dirname, "test.json"),
            code: "",
            options: [{ configFile: "", config: {} }],
        },
    ],
    invalid: [],
})
