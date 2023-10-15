import { RuleTester } from "eslint"
import path from "path"
import { dprintRules } from "../../lib/rules/dprint"

const tester = new RuleTester({
    parser: path.join(__dirname, "../../lib/simple-parser"),
})
tester.run("dprint/markdown", dprintRules.markdown, {
    valid: [
        {
            filename: path.join(__dirname, "test.md"),
            code: "**STRONG**\n",
            options: [{ configFile: "", config: {} }],
        }, // With dprint JSON configuration
        {
            filename: path.join(__dirname, "test.md"),
            code: "__STRONG__\n",
            options: [{ configFile: "test/dprint.json", config: {} }],
        }, // Non markdown file
        {
            filename: path.join(__dirname, "test.json"),
            code: "",
            options: [{ configFile: "", config: {} }],
        },
    ],
    invalid: [],
})
