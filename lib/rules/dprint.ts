import { ESLintUtils, TSESLint } from "@typescript-eslint/utils"
import path from "path"
import configSchema from "../dprint/config-schema.json"
import { format } from "../dprint/typescript"
import { AddDiff, Diff, DifferenceIterator, RemoveDiff, ReplaceDiff } from "../util/difference-iterator"
import { hasLinebreak, isWhitespace } from "../util/predicate"

/** The message IDs. */
type MessageId = (typeof dprint) extends TSESLint.RuleModule<infer T, any, any> ? T : never
/** The message. */
type Message = {
    messageId: MessageId
    data: Record<string, string>
}

const createRule = ESLintUtils.RuleCreator(ruleName =>
    `https://github.com/ben12/eslint-plugin-dprint/blob/master/docs/rules/${ruleName}.md`
)

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
            newText: JSON.stringify(d.newText.trim()),
            oldText: JSON.stringify(d.oldText.trim()),
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

export const dprint = createRule({
    name: "dprint",
    meta: {
        docs: {
            description: "Format code with dprint",
            recommended: "recommended",
        },
        fixable: "code",
        messages: {
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
        },
        schema: {
            definitions: configSchema.definitions as any,
            type: "array",
            items: [{
                type: "object",
                properties: {
                    configFile: {
                        type: "string",
                        default: "dprint.json",
                        description: "dprint configuration file (default 'dprint.json')",
                    },
                    config: configSchema as any,
                },
                additionalProperties: false,
            }],
            additionalItems: false,
        },
        type: "layout",
    },
    defaultOptions: [{ configFile: "dprint.json", config: {} }],

    create: (context, options) => ({
        Program() {
            const sourceCode = context.getSourceCode()
            const filePath = context.getFilename()
            const fileText = sourceCode.getText()
            const configFile = options[0].configFile ?? "dprint.json"
            const config = options[0].config || {}

            // Needs an absolute path
            if (!filePath || !path.isAbsolute(filePath)) {
                return
            }

            // Does format
            const formattedText = format(configFile, config, filePath, fileText)
            if (typeof formattedText !== "string") {
                return
            }

            // Generate lint reports
            for (
                const d of DifferenceIterator.iterate(
                    fileText,
                    formattedText,
                )
            ) {
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
        },
    }),
})
