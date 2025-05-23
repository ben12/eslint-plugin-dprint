import { disableTypescriptConflictRules } from "./disable-conflict-rules"

export const dockerfileRecommended = {
    plugins: ["@ben_12/dprint"],
    rules: {
        "@ben_12/dprint/dockerfile": "warn",
    },
}

export const jsonRecommended = {
    plugins: ["@ben_12/dprint"],
    rules: {
        "@ben_12/dprint/json": "warn",
    },
}

export const markdownRecommended = {
    plugins: ["@ben_12/dprint"],
    rules: {
        "@ben_12/dprint/markdown": "warn",
    },
}

export const tomlRecommended = {
    plugins: ["@ben_12/dprint"],
    rules: {
        "@ben_12/dprint/toml": "warn",
    },
}

export const typescriptRecommended = {
    plugins: ["@ben_12/dprint"],
    rules: {
        ...disableTypescriptConflictRules.rules,
        "@ben_12/dprint/typescript": "warn",
    },
}

export const malvaRecommended = {
    plugins: ["@ben_12/dprint"],
    rules: {
        "@ben_12/dprint/malva": "warn",
    },
}

export const markupRecommended = {
    plugins: ["@ben_12/dprint"],
    rules: {
        "@ben_12/dprint/markup": "warn",
    },
}

export const yamlRecommended = {
    plugins: ["@ben_12/dprint"],
    rules: {
        "@ben_12/dprint/yaml": "warn",
    },
}

export const graphqlRecommended = {
    plugins: ["@ben_12/dprint"],
    rules: {
        "@ben_12/dprint/graphql": "warn",
    },
}
