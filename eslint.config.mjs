import dprint from "@ben_12/eslint-plugin-dprint"
import simpleParser from "@ben_12/eslint-simple-parser"
import tsPlugin from "@typescript-eslint/eslint-plugin"
import tsParser from "@typescript-eslint/parser"
import { defineConfig } from "eslint/config"

export default defineConfig([{
    ignores: ["**/.eslintrc.js", ".nyc_output", "coverage", "dist"],
}, {
    files: ["**/*.ts", "**/*.js", "**/*.mjs"],

    plugins: {
        "@typescript-eslint": tsPlugin,
        "@ben_12/dprint": dprint,
    },

    languageOptions: {
        parser: tsParser,
        ecmaVersion: 5,
        sourceType: "module",
    },

    rules: {
        ...tsPlugin.configs["eslint-recommended"].rules,
        ...tsPlugin.configs["recommended"].rules,
        ...tsPlugin.configs["strict"].rules,
        ...dprint.configs["typescript-recommended"].rules,
        "@ben_12/dprint/typescript": [
            "error",
            {
                configFile: "dprint-config.json",
            },
        ],
        "@typescript-eslint/no-unused-vars": [
            "error",
            {
                "argsIgnorePattern": "^_",
                "caughtErrorsIgnorePattern": "^_",
                "destructuredArrayIgnorePattern": "^_",
                "varsIgnorePattern": "^_",
            },
        ],
    },
}, {
    files: ["**/*.md"],

    plugins: {
        "@ben_12/dprint": dprint,
    },

    languageOptions: {
        parser: simpleParser,
    },

    rules: dprint.configs["markdown-recommended"].rules,
}])
