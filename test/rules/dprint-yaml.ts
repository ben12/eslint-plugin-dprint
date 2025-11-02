/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-require-imports */
import { RuleTester } from "eslint"
import { version } from "eslint/package.json"
import path from "node:path"
import { dprintRules } from "../../lib/rules/dprint"

const eslintVersion = +version.split(".")[0]

const tester = eslintVersion >= 9
    ? new RuleTester({
        languageOptions: {
            parser: require("@ben_12/eslint-simple-parser"),
        },
    } as any)
    : new RuleTester({
        parser: require.resolve("@ben_12/eslint-simple-parser"),
    } as any)
tester.run("dprint-plugin-yaml", dprintRules.yaml, {
    valid: [
        {
            filename: path.join(__dirname, "test.yml"),
            code: "test:\n  yaml: true\n",
            options: [{ configFile: "", config: {} }],
        },
        {
            filename: path.join(__dirname, "test.yaml"),
            code: "test:\n  yaml: true\n",
            options: [{ configFile: "", config: {} }],
        }, // With dprint JSON configuration
        {
            filename: path.join(__dirname, "test.yml"),
            code: "test:\n  yaml: 'single quote'\n",
            options: [{ configFile: "test/dprint.json", config: {} }],
        }, // Non yml file
        {
            filename: path.join(__dirname, "test.json"),
            code: '["Unknown language file"]',
            options: [{ configFile: "", config: {} }],
        },
    ],
    invalid: [
        {
            filename: path.join(__dirname, "test.yml"),
            code: "test:\n  yaml: 'single quote'\n",
            output: 'test:\n  yaml: "single quote"\n',
            options: [{ configFile: "", config: {} }],
            errors: [
                {
                    messageId: "replaceCode",
                    data: { newText: String.raw`"\""`, oldText: '"\'"' },
                    line: 2,
                    column: 9,
                    endLine: 2,
                    endColumn: 10,
                },
                {
                    messageId: "replaceCode",
                    data: { newText: String.raw`"\""`, oldText: '"\'"' },
                    line: 2,
                    column: 22,
                    endLine: 2,
                    endColumn: 23,
                },
            ],
        },
    ],
})
