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
tester.run("dprint/sql", dprintRules.sql, {
    valid: [
        {
            filename: path.join(__dirname, "test.sql"),
            code: "SELECT *\nFROM my_table\n",
            options: [{ configFile: "", config: {} }],
        }, // With dprint json configuration
        {
            filename: path.join(__dirname, "test.sql"),
            code: "select *\nfrom my_table\n",
            options: [{ configFile: "test/dprint.json", config: {} }],
        }, // Non sql file
        {
            filename: path.join(__dirname, "test.unk"),
            code: "Unknown language file",
            options: [{ configFile: "", config: {} }],
        },
    ],
    invalid: [
        {
            filename: path.join(__dirname, "test.sql"),
            code: "SELECT    a, b from my_table\n",
            output: "select a, b\nfrom my_table\n",
            options: [{ configFile: "test/dprint.json", config: {} }],
            errors: [
                {
                    messageId: "replaceCode",
                    data: {
                        newText: '"select"',
                        oldText: '"SELECT"',
                    },
                    line: 1,
                    column: 1,
                    endLine: 1,
                    endColumn: 7,
                },
                {
                    messageId: "extraWhitespace",
                    data: {},
                    line: 1,
                    column: 8,
                    endLine: 1,
                    endColumn: 11,
                },
                {
                    messageId: "requireLinebreak",
                    data: { text: String.raw`"\n"` },
                    line: 1,
                    column: 15,
                    endLine: 1,
                    endColumn: 16,
                },
            ],
        },
    ],
})
