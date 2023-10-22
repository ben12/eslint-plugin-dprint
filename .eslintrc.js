"use strict"

module.exports = {
    root: true,
    ignorePatterns: [".eslintrc.js", "/.nyc_output", "/coverage", "/dist"],
    overrides: [
        {
            files: ["**/*.ts", "**/*.js"],
            parser: "@typescript-eslint/parser",
            parserOptions: {
                project: "tsconfig.json",
                sourceType: "module",
            },
            plugins: ["@typescript-eslint/eslint-plugin"],
            extends: [
                "eslint:recommended",
                "plugin:@typescript-eslint/recommended",
                "plugin:@ben_12/dprint/typescript-recommended",
            ],
            env: {
                node: true,
            }
        },
        {
            files: ["**/*.md"],
            parser: "@ben_12/eslint-simple-parser",
            extends: ["plugin:@ben_12/dprint/markdown-recommended"]
        },
    ],
}
