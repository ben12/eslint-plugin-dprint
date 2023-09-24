import { disableConflictRules } from "./disable-conflict-rules"

export const recommended = {
    plugins: ["@ben_12/dprint"],
    rules: {
        ...disableConflictRules.rules,
        "@ben_12/dprint/dprint": "warn",
    },
}
