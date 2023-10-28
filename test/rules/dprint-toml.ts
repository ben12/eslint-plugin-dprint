import { RuleTester } from "eslint"
import path from "path"
import { dprintRules } from "../../lib/rules/dprint"

const tester = new RuleTester({
    parser: require.resolve("@ben_12/eslint-simple-parser"),
})
tester.run("dprint/toml", dprintRules.toml, {
    valid: [
        {
            filename: path.join(__dirname, "test.toml"),
            code: '[hello]\nwho = "World" # comment\n',
            options: [{ configFile: "", config: {} }],
        }, // With dprint json configuration
        {
            filename: path.join(__dirname, "test.toml"),
            code: '[hello]\nwho = "World" #comment\n',
            options: [{ configFile: "test/dprint.json", config: {} }],
        }, // Non toml file
        {
            filename: path.join(__dirname, "test.unk"),
            code: "Unknown language file",
            options: [{ configFile: "", config: {} }],
        },
    ],
    invalid: [
        {
            filename: path.join(__dirname, "test.toml"),
            code: '[hello]\n\nwho ="World"   #comment',
            output: '[hello]\nwho = "World" # comment\n',
            options: [{ configFile: "", config: {} }],
            errors: [
                {
                    messageId: "extraLinebreak",
                    data: {},
                    line: 2,
                    column: 1,
                },
                {
                    messageId: "requireWhitespace",
                    data: {},
                    line: 3,
                    column: 6,
                },
                {
                    messageId: "moveCode",
                    data: {
                        text: '"#"',
                    },
                    line: 3,
                    column: 14,
                    endLine: 3,
                    endColumn: 17,
                },
                {
                    messageId: "requireLinebreak",
                    data: {},
                    line: 3,
                    column: 24,
                },
            ],
        },
    ],
})
