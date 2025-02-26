/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-require-imports */
import { RuleTester } from "eslint"
import { version } from "eslint/package.json"
import path from "path"
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
tester.run("dprint-plugin-markup", dprintRules.markup, {
    valid: [
        {
            filename: path.join(__dirname, "test.html"),
            code: "<html></html>\n",
            options: [{ configFile: "", config: {} }],
        },
        {
            filename: path.join(__dirname, "test.html"),
            code: "<html>\n  <head></head>\n</html>\n",
            options: [{ configFile: "", config: {} }],
        }, // With dprint JSON configuration
        {
            filename: path.join(__dirname, "test.html"),
            code: "<html>\n</html>\n",
            options: [{ configFile: "test/dprint.json", config: {} }],
        }, // Non json file
        {
            filename: path.join(__dirname, "test.unk"),
            code: "Unknown language file",
            options: [{ configFile: "", config: {} }],
        },
    ],
    invalid: [
        {
            filename: path.join(__dirname, "test.html"),
            code: "<html>\n<head>  </head></html>",
            output: "<html>\n  <head></head>\n</html>\n",
            options: [{ configFile: "", config: {} }],
            errors: [
                {
                    messageId: "requireWhitespace",
                    data: {},
                    line: 2,
                    column: 1,
                },
                {
                    messageId: "extraWhitespace",
                    data: {},
                    line: 2,
                    column: 7,
                    endLine: 2,
                    endColumn: 9,
                },
                {
                    messageId: "requireLinebreak",
                    data: {},
                    line: 2,
                    column: 16,
                },
                {
                    messageId: "requireLinebreak",
                    data: {},
                    line: 2,
                    column: 23,
                },
            ],
        },
    ],
})
