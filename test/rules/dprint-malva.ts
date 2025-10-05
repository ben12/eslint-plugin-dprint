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
tester.run("dprint-plugin-malva", dprintRules.malva, {
    valid: [
        {
            filename: path.join(__dirname, "test.css"),
            code: ".test {\n  color: #ff0000;\n}\n",
            options: [{ configFile: "", config: {} }],
        },
        {
            filename: path.join(__dirname, "test.scss"),
            code: ".test {\n  color: #f00;\n}\n",
            options: [{ configFile: "", config: {} }],
        },
        {
            filename: path.join(__dirname, "test.less"),
            code: ".test {\n  color: #ff0000;\n}\n",
            options: [{ configFile: "", config: {} }],
        },
        {
            filename: path.join(__dirname, "test.sass"),
            code: ".test\n  color: #ff0000\n",
            options: [{ configFile: "", config: {} }],
        }, // With dprint JSON configuration
        {
            filename: path.join(__dirname, "test.css"),
            code: ".test {\n  color: #FF0000;\n}\n",
            options: [{ configFile: "test/dprint.json", config: {} }],
        }, // Non json file
        {
            filename: path.join(__dirname, "test.ts"),
            code: "Unknown language file",
            options: [{ configFile: "", config: {} }],
        },
    ],
    invalid: [
        {
            filename: path.join(__dirname, "test.css"),
            code: ".test { color: #f00; }\n",
            output: ".test {\n  color: #f00;\n}\n",
            options: [{ configFile: "", config: {} }],
            errors: [
                {
                    messageId: "requireLinebreak",
                    data: {},
                    line: 1,
                    column: 8,
                    endLine: 1,
                    endColumn: 9,
                },
                {
                    messageId: "requireLinebreak",
                    data: {},
                    line: 1,
                    column: 21,
                    endLine: 1,
                    endColumn: 22,
                },
            ],
        },
    ],
})
