import { Rule, SourceCode } from "eslint"
import { JSONSchema4 } from "json-schema"
import path from "path"
import dockerfileConfigSchema from "../dprint/dockerfile-config-schema.json"
import { format } from "../dprint/dprint"
import jsonConfigSchema from "../dprint/json-config-schema.json"
import markdownConfigSchema from "../dprint/markdown-config-schema.json"
import tomlConfigSchema from "../dprint/toml-config-schema.json"
import tsConfigSchema from "../dprint/typescript-config-schema.json"
import { AddDiff, Diff, DifferenceIterator, RemoveDiff, ReplaceDiff } from "../util/difference-iterator"
import { hasLinebreak, isWhitespace } from "../util/predicate"

const configSchemas = [
    { name: "dockerfile", configSchema: dockerfileConfigSchema as JSONSchema4 },
    { name: "json", configSchema: jsonConfigSchema as JSONSchema4 },
    { name: "markdown", configSchema: markdownConfigSchema as JSONSchema4 },
    { name: "toml", configSchema: tomlConfigSchema as JSONSchema4 },
    { name: "typescript", configSchema: tsConfigSchema as JSONSchema4 },
]

const messages = {
    requireLinebreak: "Require line break(s).",
    extraLinebreak: "Extra line break(s).",
    requireWhitespace: "Require whitespace(s).",
    extraWhitespace: "Extra whitespace(s).",
    requireCode: "Require code {{text}}.",
    extraCode: "Extra code {{text}}.",
    replaceWhitespace: "Require tweaking whitespace(s).",
    replaceCode: "Require code {{newText}} instead of {{oldText}}.",
    moveCodeToNextLine: "Move code {{text}} to the next line.",
    moveCodeToPrevLine: "Move code {{text}} to the previous line.",
    moveCode: "Require tweaking whitespaces around code {{text}}.",
} as const

/** The message IDs. */
type MessageId = keyof typeof messages
/** The message. */
type Message = {
    messageId: MessageId
    data: Record<string, string>
}

/**
 * Count line breaks in the head whitespace sequence.
 * @param s The text to check.
 */
function getLineNumberOfFirstCode(s: string): number {
    const m = /^\s+/u.exec(s)
    if (!m) {
        return 0
    }

    const Linebreak = /\r\n|[\r\n]/gu
    let count = 0
    while (Linebreak.exec(m[0]) != null) {
        count += 1
    }

    return count
}

function isAddDiff(d: Diff): d is AddDiff {
    return d.type === "add"
}

function isRemoveDiff(d: Diff): d is RemoveDiff {
    return d.type === "remove"
}

/**
 * Create the report message of a given add difference.
 * @param d The add difference object to create message.
 */
function createAddMessage(d: AddDiff): Message {
    if (isWhitespace(d.newText)) {
        return {
            messageId: hasLinebreak(d.newText)
                ? "requireLinebreak"
                : "requireWhitespace",
            data: {},
        }
    }
    return {
        messageId: "requireCode",
        data: { text: JSON.stringify(d.newText.trim()) },
    }
}

/**
 * Create the report message of a given remove difference.
 * @param d The remove difference object to create message.
 */
function createRemoveMessage(d: RemoveDiff): Message {
    if (isWhitespace(d.oldText)) {
        return {
            messageId: hasLinebreak(d.oldText)
                ? "extraLinebreak"
                : "extraWhitespace",
            data: {},
        }
    }
    return {
        messageId: "extraCode",
        data: { text: JSON.stringify(d.oldText.trim()) },
    }
}

/**
 * Create the report message of a given replace difference if is whitespace difference.
 * @param d The replace difference object to create message.
 */
function createWhitespaceMessage(d: ReplaceDiff): Message | false {
    if (isWhitespace(d.oldText) && isWhitespace(d.newText)) {
        const oldHasLinebreak = hasLinebreak(d.oldText)
        const newHasLinebreak = hasLinebreak(d.newText)
        if (!oldHasLinebreak && newHasLinebreak) {
            return {
                messageId: "requireLinebreak",
                data: {},
            }
        }
        return {
            messageId: oldHasLinebreak && !newHasLinebreak
                ? "extraLinebreak"
                : "replaceWhitespace",
            data: {},
        }
    }
    return false
}

/**
 * Create the report message of a given replace difference if is moved code difference.
 * @param d The replace difference object to create message.
 */
function createMoveMessage(d: ReplaceDiff): Message | false {
    if (d.oldText.trim() === d.newText.trim()) {
        const oldLine = getLineNumberOfFirstCode(d.oldText)
        const newLine = getLineNumberOfFirstCode(d.newText)
        if (newLine > oldLine) {
            return {
                messageId: "moveCodeToNextLine",
                data: { text: JSON.stringify(d.oldText.trim()) },
            }
        }
        return {
            messageId: newLine < oldLine
                ? "moveCodeToPrevLine"
                : "moveCode",
            data: { text: JSON.stringify(d.oldText.trim()) },
        }
    }
    return false
}

/**
 * Create the report message of a given replace difference.
 * @param d The replace difference object to create message.
 */
function createRepaceMessage(d: ReplaceDiff): Message {
    return {
        messageId: "replaceCode",
        data: {
            newText: JSON.stringify(d.newText),
            oldText: JSON.stringify(d.oldText),
        },
    }
}

/**
 * Create the report message of a given difference.
 * @param d The difference object to create message.
 */
function createMessage(d: Diff): Message {
    if (isAddDiff(d)) {
        return createAddMessage(d)
    }
    if (isRemoveDiff(d)) {
        return createRemoveMessage(d)
    }
    return createWhitespaceMessage(d) ||
        createMoveMessage(d) ||
        createRepaceMessage(d)
}

const defaultOptions = [{ configFile: "dprint.json", config: {} }] as const

export const dprintRules: { [name: string]: Rule.RuleModule } = configSchemas.map((
    config,
): { [name: string]: Rule.RuleModule } => ({
    [config.name]: {
        meta: {
            docs: {
                description: `Format ${config.name} with dprint`,
                url: `https://github.com/ben12/eslint-plugin-dprint/blob/master/docs/rules/dprint-${config.name}.md`,
                recommended: true,
            },
            fixable: "code",
            messages,
            schema: {
                definitions: config.configSchema.definitions,
                type: "array",
                items: [{
                    type: "object",
                    properties: {
                        configFile: {
                            type: "string",
                            default: "dprint.json",
                            description: "dprint configuration file (default 'dprint.json')",
                        },
                        config: {
                            type: "object",
                            properties: config.configSchema.properties,
                            additionalProperties: false,
                        },
                    },
                    additionalProperties: false,
                }],
                additionalItems: false,
            },
            type: "layout",
        },
        create: (context) => ({
            Program() {
                const sourceCode = context.sourceCode ?? context.getSourceCode()
                const filePath = context.filename ?? context.getFilename()
                const fileText = sourceCode.getText()
                const options = context.options[0] ?? defaultOptions
                const configFile = options.configFile ?? "dprint.json"
                const config = options.config || {}

                // Needs an absolute path
                if (!filePath || !path.isAbsolute(filePath)) {
                    return
                }

                // Does format
                const formattedText = format(configFile, config, filePath, fileText)
                if (typeof formattedText !== "string") {
                    return
                }

                generateLintReports(fileText, formattedText, sourceCode, context)
            },
        }),
    },
})).reduce((r1, r2) => ({ ...r1, ...r2 }))

function generateLintReports(
    fileText: string,
    formattedText: string,
    sourceCode: SourceCode,
    context: Rule.RuleContext,
) {
    for (const d of DifferenceIterator.iterate(fileText, formattedText)) {
        const loc = d.type === "add"
            ? sourceCode.getLocFromIndex(d.range[0])
            : {
                start: sourceCode.getLocFromIndex(d.range[0]),
                end: sourceCode.getLocFromIndex(d.range[1]),
            }
        const { messageId, data } = createMessage(d)

        context.report({
            loc,
            messageId,
            data,

            fix(fixer) {
                const range = d.range as [number, number]
                if (d.type === "add") {
                    return fixer.insertTextAfterRange(range, d.newText)
                }
                if (d.type === "remove") {
                    return fixer.removeRange(range)
                }
                return fixer.replaceTextRange(range, d.newText)
            },
        })
    }
}
