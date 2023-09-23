import { disableConflictRules } from "./disable-conflict-rules"

export const recommended = {
    plugins: ["@ben12/dprint"],
    rules: {
        ...disableConflictRules.rules,
        "@ben12/dprint/dprint": "warn",
    },
}
