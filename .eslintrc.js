"use strict"

module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: 'tsconfig.json',
        sourceType: 'module',
    },
    plugins: ['@typescript-eslint/eslint-plugin'],
    extends: ['plugin:@typescript-eslint/recommended'],
    root: true,
    env: {
        node: true,
    },
    ignorePatterns: ['.eslintrc.js', "/.nyc_output", "/coverage", "/dist"],
    rules: {
        '@typescript-eslint/no-explicit-any': 'off',
    }
}
