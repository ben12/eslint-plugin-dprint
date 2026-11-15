/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-require-imports */
import { RuleTester } from "eslint"
import { version } from "eslint/package.json"
import path from "node:path"
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
tester.run("dprint-plugin-markup", dprintRules.markup, {
    valid: [
        {
            filename: path.join(__dirname, "test.html"),
            code: "<html></html>\n",
            options: [{ configFile: "", config: {} }],
        },
        {
            filename: path.join(__dirname, "test.html"),
            code: "<html>\n  <head></head>\n</html>\n",
            options: [{ configFile: "", config: {} }],
        }, // With dprint JSON configuration
        {
            filename: path.join(__dirname, "test.html"),
            code: "<html>\n</html>\n",
            options: [{ configFile: "test/dprint.json", config: {} }],
        }, // Non json file
        {
            filename: path.join(__dirname, "test.unk"),
            code: "Unknown language file",
            options: [{ configFile: "", config: {} }],
        },
        {
            filename: path.join(__dirname, "test.vue"),
            code: `<template>
  <div>
    test
  </div>
</template>
<script lang="ts" setup>
  console.log(1, 2, 3);
  const someFn = () => {
    console.log(4, 5, 6);
  };
</script>
`,
            options: [{ configFile: "test/dprint.json", config: { scriptIndent: true } }],
        },
    ],
    invalid: [
        {
            filename: path.join(__dirname, "test.html"),
            code: "<html>\n<head>  </head></html>",
            output: "<html>\n  <head></head>\n</html>\n",
            options: [{ configFile: "", config: {} }],
            errors: [
                {
                    messageId: "requireWhitespace",
                    data: {},
                    line: 2,
                    column: 1,
                },
                {
                    messageId: "extraWhitespace",
                    data: {},
                    line: 2,
                    column: 7,
                    endLine: 2,
                    endColumn: 9,
                },
                {
                    messageId: "requireLinebreak",
                    data: {},
                    line: 2,
                    column: 16,
                },
                {
                    messageId: "requireLinebreak",
                    data: {},
                    line: 2,
                    column: 23,
                },
            ],
        },
        {
            filename: path.join(__dirname, "test.vue"),
            code: `<template>
  <div>test
  </div>
</template>
<script lang="ts" setup>
  console.log(1, 2, 3);
const someFn = () => {
    console.log(4, 5, 6)
  };
</script>
`,
            output: `<template>
  <div>
    test
  </div>
</template>
<script lang="ts" setup>
  console.log(1, 2, 3);
  const someFn = () => {
    console.log(4, 5, 6);
  };
</script>
`,
            options: [{ configFile: "test/dprint.json", config: { scriptIndent: true } }],
            errors: [
                {
                    messageId: "requireLinebreak",
                    data: {},
                    line: 2,
                    column: 8,
                },
                {
                    messageId: "requireWhitespace",
                    data: {},
                    line: 7,
                    column: 1,
                },
                {
                    messageId: "requireCode",
                    data: {
                        text: '";"',
                    },
                    line: 8,
                    column: 25,
                },
            ],
        },
    ],
})
