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
            filename: path.join(__dirname, "test.unk"),
            code: "Unknown language file",
            options: [{ configFile: "", config: {} }],
        },
    ],
    invalid: [
        {
            filename: path.join(__dirname, "Dockerfile"),
            code: "FROM   ubuntu:latest\n\nCOPY--chown=user:use test.txt /dir/\r\n\r\n",
            output: "FROM ubuntu:latest\r\n\r\nCOPY --chown=user:use test.txt /dir/\r\n",
            options: [{ configFile: "", config: { "newLineKind": "crlf" } }],
            errors: [
                {
                    messageId: "extraWhitespace",
                    data: {},
                    line: 1,
                    column: 6,
                    endLine: 1,
                    endColumn: 8,
                },
                {
                    messageId: "replaceWhitespace",
                    data: {},
                    line: 1,
                    column: 21,
                    endLine: 2,
                    endColumn: 1,
                },
                {
                    messageId: "requireWhitespace",
                    data: {},
                    line: 3,
                    column: 5,
                },
                {
                    messageId: "extraLinebreak",
                    data: {},
                    line: 4,
                    column: 1,
                    endLine: 5,
                    endColumn: 1,
                },
            ],
        },
        {
            filename: path.join(__dirname, "Dockerfile"),
            code: "FROM ubuntu:latest\n\nENV TEST equality\n",
            output: "FROM ubuntu:latest\n\nENV TEST=equality\n",
            options: [{ configFile: "", config: {} }],
            errors: [
                {
                    messageId: "replaceCode",
                    data: {
                        newText: '"="',
                        oldText: '" "',
                    },
                    line: 3,
                    column: 9,
                    endLine: 3,
                    endColumn: 10,
                },
            ],
        },
    ],
})
