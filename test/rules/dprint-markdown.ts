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
tester.run("dprint/markdown", dprintRules.markdown, {
    valid: [
        {
            filename: path.join(__dirname, "test.md"),
            code: "**STRONG**\n",
            options: [{ configFile: "", config: {} }],
        }, // With dprint JSON configuration
        {
            filename: path.join(__dirname, "test.md"),
            code: "__STRONG__\n",
            options: [{ configFile: "test/dprint.json", config: {} }],
        }, // Non markdown file
        {
            filename: path.join(__dirname, "test.unk"),
            code: "Unknown language file",
            options: [{ configFile: "", config: {} }],
        },
    ],
    invalid: [
        {
            filename: path.join(__dirname, "test.md"),
            code: "#  Title\ntexte",
            output: "# Title\n\ntexte\n",
            options: [{ configFile: "", config: {} }],
            errors: [
                {
                    messageId: "extraWhitespace",
                    data: {},
                    line: 1,
                    column: 3,
                    endLine: 1,
                    endColumn: 4,
                },
                {
                    messageId: "requireLinebreak",
                    data: {},
                    line: 2,
                    column: 1,
                },
                {
                    messageId: "requireLinebreak",
                    data: {},
                    line: 2,
                    column: 6,
                },
            ],
        },
        {
            filename: path.join(__dirname, "test.md"),
            code: "__STRONG__\n",
            output: "**STRONG**\n",
            options: [{ configFile: "", config: {} }],
            errors: [
                {
                    messageId: "replaceCode",
                    data: {
                        oldText: '"__"',
                        newText: '"**"',
                    },
                    line: 1,
                    column: 1,
                    endLine: 1,
                    endColumn: 3,
                },
                {
                    messageId: "replaceCode",
                    data: {
                        oldText: '"__"',
                        newText: '"**"',
                    },
                    line: 1,
                    column: 9,
                    endLine: 1,
                    endColumn: 11,
                },
            ],
        },
    ],
})
