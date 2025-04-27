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
tester.run("dprint-plugin-graphql", dprintRules.graphql, {
    valid: [
        {
            filename: path.join(__dirname, "test.graphql"),
            code: "query Query(\n  $a: A\n  $b: B\n) {\n  field1\n  field2\n}\n",
            options: [{ configFile: "", config: {} }],
        },
        {
            filename: path.join(__dirname, "test.gql"),
            code: "query Query(\n  $a: A\n  $b: B\n) {\n  field1\n  field2\n}\n",
            options: [{ configFile: "", config: {} }],
        }, // With dprint JSON configuration
        {
            filename: path.join(__dirname, "test.gql"),
            code: "query Query($a: A, $b: B) {\n  field1\n  field2\n}\n",
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
            filename: path.join(__dirname, "test.gql"),
            code: "query Query(\n  $a: A,\n  $b: B) {\nfield1 field2\n}\n",
            output: "query Query(\n  $a: A\n  $b: B\n) {\n  field1\n  field2\n}\n",
            options: [{ configFile: "", config: {} }],
            errors: [
                {
                    messageId: "extraCode",
                    data: { text: '","' },
                    line: 2,
                    column: 8,
                    endLine: 2,
                    endColumn: 9,
                },
                {
                    messageId: "requireLinebreak",
                    line: 3,
                    column: 8,
                    endLine: 3,
                    endColumn: 8,
                },
                {
                    messageId: "requireWhitespace",
                    line: 4,
                    column: 1,
                    endLine: 4,
                    endColumn: 1,
                },
                {
                    messageId: "requireLinebreak",
                    line: 4,
                    column: 7,
                    endLine: 4,
                    endColumn: 8,
                },
            ],
        },
    ],
})
