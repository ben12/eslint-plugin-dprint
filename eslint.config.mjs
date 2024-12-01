import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import simpleParser from "@ben_12/eslint-simple-parser";
import dprint from "@ben_12/eslint-plugin-dprint";


export default [{
    ignores: ["**/.eslintrc.js", ".nyc_output", "coverage", "dist"],
}, {
    files: ["**/*.ts", "**/*.js"],

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
        ...dprint.configs["typescript-recommended"].rules
    }
}, {
    files: ["**/*.md"],

    plugins: {
        "@ben_12/dprint": dprint,
    },

    languageOptions: {
        parser: simpleParser,
    },

    rules: dprint.configs["markdown-recommended"].rules

}];