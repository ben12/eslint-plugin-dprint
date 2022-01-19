import { disableConflictRules } from "./disable-conflict-rules"

export const recommended = {
    plugins: ["@phaphoso/dprint"],
    rules: {
        ...disableConflictRules.rules,
        "@phaphoso/dprint/dprint": "warn",
    },
}
