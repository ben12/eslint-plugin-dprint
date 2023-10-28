import { RuleTester } from "eslint"
import path from "path"
import { dprintRules } from "../../lib/rules/dprint"

const tester = new RuleTester({
    parser: require.resolve("@ben_12/eslint-simple-parser"),
})
tester.run("dprint/typescript", dprintRules.typescript, {
    valid: [
        {
            filename: path.join(__dirname, "test.ts"),
            code: 'console.log("hello!");\n',
            options: [{ configFile: "", config: {} }],
        }, // With dprint JSON configuration
        {
            filename: path.join(__dirname, "test.ts"),
            code: "console.log('hello!');\n",
            options: [{ configFile: "test/dprint.json", config: {} }],
        }, // Non JS/TS file
        {
            filename: path.join(__dirname, "test.unk"),
            code: "Unknown language file",
            options: [{ configFile: "", config: {} }],
        },
    ],
    invalid: [
        {
            filename: path.join(__dirname, "test.ts"),
            code: "console . log('hello!')",
            output: 'console.log("hello!");\n',
            options: [{ configFile: "", config: {} }],
            errors: [
                {
                    messageId: "extraWhitespace",
                    data: {},
                    column: 8,
                    endColumn: 9,
                },
                {
                    messageId: "extraWhitespace",
                    data: {},
                    column: 10,
                    endColumn: 11,
                },
                {
                    messageId: "replaceCode",
                    data: { newText: '"\\""', oldText: '"\'"' },
                    column: 15,
                    endColumn: 16,
                },
                {
                    messageId: "replaceCode",
                    data: { newText: '"\\""', oldText: '"\'"' },
                    column: 22,
                    endColumn: 23,
                },
                {
                    messageId: "requireCode",
                    data: { text: '";"' },
                    column: 24,
                    endColumn: undefined,
                },
            ],
        },
        {
            filename: path.join(__dirname, "test.ts"),
            parser: require.resolve("@typescript-eslint/parser"),
            code: 'type TypeScriptPlugin =\n typeof import("dprint-plugin-typescript").TypeScriptPlugin;\n',
            output: 'type TypeScriptPlugin =\n    typeof import("dprint-plugin-typescript").TypeScriptPlugin;\n',
            options: [{ configFile: "", config: { useTabs: false, indentWidth: 4, lineWidth: 80 } }],
            errors: [{
                messageId: "requireWhitespace",
                data: {},
                line: 2,
                column: 2,
                endColumn: undefined,
            }],
        },
        {
            filename: path.join(__dirname, "test.ts"),
            parser: require.resolve("@typescript-eslint/parser"),
            code: 'type TypeScriptPlugin = typeof import("dprint-plugin-typescript").TypeScriptPlugin;',
            output: 'type TypeScriptPlugin =\n    typeof import("dprint-plugin-typescript").TypeScriptPlugin;\n',
            options: [{ configFile: "", config: { useTabs: false, indentWidth: 4, lineWidth: 80 } }],
            errors: [{
                messageId: "requireLinebreak",
                data: {},
                column: 24,
                endColumn: 25,
            }, {
                messageId: "requireLinebreak",
                data: {},
                line: 1,
                column: 84,
            }],
        },
        {
            filename: path.join(__dirname, "test.ts"),
            parser: require.resolve("@typescript-eslint/parser"),
            code: 'console.log("hello!");;;\n',
            output: 'console.log("hello!");\n',
            options: [{ configFile: "", config: { useTabs: false, indentWidth: 4, lineWidth: 80 } }],
            errors: [{
                messageId: "extraCode",
                data: {
                    text: '";;"',
                },
                column: 23,
                endColumn: 25,
            }],
        },
        {
            filename: path.join(__dirname, "test.ts"),
            parser: require.resolve("@typescript-eslint/parser"),
            code: 'type TFormatFileText =\n    typeof import("@dprint/core").formatText;\n\n',
            output: 'type TFormatFileText = typeof import("@dprint/core").formatText;\n',
            options: [{ configFile: "", config: { useTabs: false, indentWidth: 4, lineWidth: 80 } }],
            errors: [{
                messageId: "extraLinebreak",
                data: {},
                line: 1,
                column: 23,
                endLine: 2,
                endColumn: 5,
            }, {
                messageId: "extraLinebreak",
                data: {},
                line: 3,
                column: 1,
                endLine: 4,
                endColumn: 1,
            }],
        },
        {
            filename: path.join(__dirname, "test.ts"),
            parser: require.resolve("@typescript-eslint/parser"),
            code: `const loc = d.type === "added" ?
    sourceCode.getLocFromIndex(d.range[0]) :
    {
        start: sourceCode.getLocFromIndex(d.range[0]),
        end: sourceCode.getLocFromIndex(d.range[1]),
    };
`,
            output: `const loc = d.type === "added"
    ? sourceCode.getLocFromIndex(d.range[0])
    : {
        start: sourceCode.getLocFromIndex(d.range[0]),
        end: sourceCode.getLocFromIndex(d.range[1]),
    };
`,
            options: [{ configFile: "", config: { useTabs: false, indentWidth: 4, lineWidth: 80 } }],
            errors: [
                {
                    messageId: "moveCodeToNextLine",
                    data: { text: '"?"' },
                    line: 1,
                    column: 31,
                    endLine: 2,
                    endColumn: 5,
                },
                {
                    messageId: "moveCodeToNextLine",
                    data: { text: '":"' },
                    line: 2,
                    column: 43,
                    endLine: 3,
                    endColumn: 5,
                },
            ],
        },
        {
            filename: path.join(__dirname, "test.ts"),
            parser: require.resolve("@typescript-eslint/parser"),
            code: `const loc = d.type === "added"
    ? sourceCode.getLocFromIndex(d.range[0])
    : {
        start: sourceCode.getLocFromIndex(d.range[0]),
        end: sourceCode.getLocFromIndex(d.range[1]),
    };
`,
            output: `const loc = d.type === "added" ?
    sourceCode.getLocFromIndex(d.range[0]) :
    {
        start: sourceCode.getLocFromIndex(d.range[0]),
        end: sourceCode.getLocFromIndex(d.range[1]),
    };
`,
            options: [{
                configFile: "",
                config: { useTabs: false, indentWidth: 4, lineWidth: 80, operatorPosition: "sameLine" },
            }],
            errors: [
                {
                    messageId: "moveCodeToPrevLine",
                    data: { text: '"?"' },
                    line: 1,
                    column: 31,
                    endLine: 2,
                    endColumn: 7,
                },
                {
                    messageId: "moveCodeToPrevLine",
                    data: { text: '":"' },
                    line: 2,
                    column: 45,
                    endLine: 3,
                    endColumn: 7,
                },
            ],
        },
    ],
})
