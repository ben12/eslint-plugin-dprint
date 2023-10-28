import { RuleTester } from "eslint"
import path from "path"
import { dprintRules } from "../../lib/rules/dprint"

const tester = new RuleTester({
    parser: require.resolve("@ben_12/eslint-simple-parser"),
})
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
