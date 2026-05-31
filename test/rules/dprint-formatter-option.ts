/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-require-imports */
import { createFromBuffer } from "@dprint/formatter"
import { RuleTester } from "eslint"
import { version } from "eslint/package.json"
import assert from "node:assert"
import * as fs from "node:fs"
import path from "node:path"
import { format, FormatterInput } from "../../lib/dprint/dprint"
import { dprintRules } from "../../lib/rules/dprint"

declare const describe: (name: string, fn: () => void) => void
declare const it: (name: string, fn: () => void) => void

const eslintVersion = +version.split(".")[0]

function makeTester() {
    return eslintVersion >= 9
        ? new RuleTester({
            languageOptions: {
                parser: require("@ben_12/eslint-simple-parser"),
            },
        } as any)
        : new RuleTester({
            parser: require.resolve("@ben_12/eslint-simple-parser"),
        } as any)
}

function settingsFor(formatter: FormatterInput, ruleName = "typescript") {
    return { "@ben_12/dprint": { formatters: { [ruleName]: formatter } } }
}

// (a) `getPath`-style object — same shape as `@dprint/typescript`.
const typescriptFormatter = require("@dprint/typescript") as { getPath(): string }

makeTester().run("settings: getPath object", dprintRules.typescript, {
    valid: [
        {
            filename: path.join(__dirname, "test.ts"),
            code: 'console.log("hello!");\n',
            options: [{ configFile: "" }],
            settings: settingsFor(typescriptFormatter),
        },
    ],
    invalid: [
        {
            filename: path.join(__dirname, "test.ts"),
            code: "console . log('hello!')",
            output: 'console.log("hello!");\n',
            options: [{ configFile: "" }],
            settings: settingsFor(typescriptFormatter),
            errors: [
                { messageId: "extraWhitespace" },
                { messageId: "extraWhitespace" },
                { messageId: "replaceCode" },
                { messageId: "replaceCode" },
                { messageId: "requireCode" },
            ],
        },
    ],
})

// (b) `getBuffer`-style object — same shape as `dprint-plugin-yaml`/`-markup`/etc.
const markupWasmPath = require.resolve("dprint-plugin-markup/plugin.wasm")
const markupBufferFormatter = {
    getBuffer(): Buffer {
        return fs.readFileSync(markupWasmPath)
    },
}

makeTester().run("settings: getBuffer object", dprintRules.markup, {
    valid: [
        {
            filename: path.join(__dirname, "test.html"),
            code: "<html></html>\n",
            options: [{ configFile: "" }],
            settings: settingsFor(markupBufferFormatter, "markup"),
        },
    ],
    invalid: [
        {
            filename: path.join(__dirname, "test.html"),
            code: "<html>\n<head>  </head></html>",
            output: "<html>\n  <head></head>\n</html>\n",
            options: [{ configFile: "" }],
            settings: settingsFor(markupBufferFormatter, "markup"),
            errors: [
                { messageId: "requireWhitespace" },
                { messageId: "extraWhitespace" },
                { messageId: "requireLinebreak" },
                { messageId: "requireLinebreak" },
            ],
        },
    ],
})

// (c) Raw `Buffer` / `Uint8Array` of wasm bytes are exercised by the direct `format()` unit tests
// below. RuleTester deep-freezes `settings` (rule-tester.js:216), and `Object.freeze` rejects
// TypedArrays that contain elements, so a raw buffer in `settings` cannot be tested via
// RuleTester. Production ESLint does NOT freeze settings, so the path works at runtime — and we
// cover it via the direct `format()` calls in the describe() block below.
const typescriptWasmBuffer = fs.readFileSync(typescriptFormatter.getPath())

// (d) Already-constructed Formatter from createFromBuffer.
const prebuiltFormatter = createFromBuffer(typescriptWasmBuffer)

makeTester().run("settings: pre-built Formatter", dprintRules.typescript, {
    valid: [
        {
            filename: path.join(__dirname, "test.ts"),
            code: 'console.log("hello!");\n',
            options: [{ configFile: "" }],
            settings: settingsFor(prebuiltFormatter),
        },
    ],
    invalid: [
        {
            filename: path.join(__dirname, "test.ts"),
            code: "console.log('hello!')",
            output: 'console.log("hello!");\n',
            options: [{ configFile: "" }],
            settings: settingsFor(prebuiltFormatter),
            errors: [
                { messageId: "replaceCode" },
                { messageId: "replaceCode" },
                { messageId: "requireCode" },
            ],
        },
    ],
})

// (e) Backward compatibility — no settings, the rule falls back to the global plugin table.
makeTester().run("no settings — falls back to plugin lookup", dprintRules.typescript, {
    valid: [
        {
            filename: path.join(__dirname, "test.ts"),
            code: 'console.log("hello!");\n',
            options: [{ configFile: "" }],
        },
    ],
    invalid: [
        {
            filename: path.join(__dirname, "test.ts"),
            code: "console.log('hello!')",
            output: 'console.log("hello!");\n',
            options: [{ configFile: "" }],
            errors: 3,
        },
    ],
})

describe("format() with formatter input (direct unit test)", () => {
    it("does not log 'Plugin not found' when a formatter is supplied", () => {
        const originalError = console.error
        const errors: string[] = []
        console.error = (...args: unknown[]) => {
            errors.push(args.map(String).join(" "))
        }
        try {
            const result = format(
                "",
                {},
                {},
                path.join(__dirname, "test.ts"),
                "console.log('x')",
                "typescript",
                typescriptFormatter,
            )
            assert.strictEqual(result, 'console.log("x");\n')
        } finally {
            console.error = originalError
        }
        assert.deepStrictEqual(
            errors.filter(msg => msg.includes("Plugin not found")),
            [],
            "Expected no 'Plugin not found' messages when formatter is supplied",
        )
    })

    it("accepts a getPath object", () => {
        const out = format(
            "",
            {},
            {},
            path.join(__dirname, "test.ts"),
            "console.log('a')",
            "typescript",
            typescriptFormatter,
        )
        assert.strictEqual(out, 'console.log("a");\n')
    })

    it("accepts a getBuffer object", () => {
        const out = format(
            "",
            {},
            {},
            path.join(__dirname, "test.html"),
            "<html>  <body></body></html>",
            "markup",
            markupBufferFormatter,
        )
        assert.strictEqual(out, "<html><body></body></html>\n")
    })

    it("accepts a raw Buffer", () => {
        const out = format(
            "",
            {},
            {},
            path.join(__dirname, "test.ts"),
            "console.log('b')",
            "typescript",
            typescriptWasmBuffer,
        )
        assert.strictEqual(out, 'console.log("b");\n')
    })

    it("accepts a pre-built Formatter", () => {
        const out = format(
            "",
            {},
            {},
            path.join(__dirname, "test.ts"),
            "console.log('c')",
            "typescript",
            prebuiltFormatter,
        )
        assert.strictEqual(out, 'console.log("c");\n')
    })

    it("returns input unchanged when an unknown plugin name is used and no formatter is supplied", () => {
        const originalError = console.error
        console.error = () => {}
        try {
            const out = format("", {}, {}, path.join(__dirname, "test.ts"), "console.log('x')", "does-not-exist")
            assert.strictEqual(out, "console.log('x')")
        } finally {
            console.error = originalError
        }
    })
})
