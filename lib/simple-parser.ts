import { Linter } from "eslint"

export function parseForESLint(text: string): Linter.ESLintParseResult {
    const lines = text.match(/[^\n\r]+(\r\n|\n|\r)|\r\n|\n|\r/g) ?? [text]
    let range = 0
    return {
        ast: {
            body: [],
            comments: [],
            range: [0, text.length],
            loc: {
                start: { line: 1, column: 0 },
                end: { line: lines.length, column: lines[lines.length - 1].length - 1 },
            },
            tokens: lines.map((line, index) => {
                const startRange = range
                range += line.length
                return {
                    type: "String",
                    value: line,
                    range: [startRange, range],
                    loc: {
                        start: { line: index + 1, column: 0 },
                        end: { line: index + 1, column: line.length - 1 },
                    },
                }
            }),
            type: "Program",
            sourceType: "script",
        },
    }
}
