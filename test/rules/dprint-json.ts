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
            filename: path.join(__dirname, "test.unk"),
            code: "Unknown language file",
            options: [{ configFile: "", config: {} }],
        },
    ],
    invalid: [
        {
            filename: path.join(__dirname, "test.json"),
            code: '{\n"hello": "world"} //comment',
            output: '{\n  "hello": "world"\n} // comment\n',
            options: [{ configFile: "", config: {} }],
            errors: [
                {
                    messageId: "requireWhitespace",
                    data: {},
                    line: 2,
                    column: 1,
                },
                {
                    messageId: "requireLinebreak",
                    data: {},
                    line: 2,
                    column: 17,
                },
                {
                    messageId: "requireWhitespace",
                    data: {},
                    line: 2,
                    column: 21,
                },
                {
                    messageId: "requireLinebreak",
                    data: {},
                    line: 2,
                    column: 28,
                },
            ],
        },
        {
            filename: path.join(__dirname, "test.json"),
            code: '{\n  "hello": "world"\n}\n',
            output: '{\n  "hello": "world",\n}\n',
            options: [{ configFile: "", config: { "trailingCommas": "always" } }],
            errors: [
                {
                    messageId: "requireCode",
                    data: {
                        text: '","',
                    },
                    line: 2,
                    column: 19,
                },
            ],
        },
    ],
})
