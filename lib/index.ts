import { disableConflictRules } from "./configs/disable-conflict-rules"
import { recommended } from "./configs/recommended"
import { dprint } from "./rules/dprint"

module.exports = {
    configs: {
        "disable-conflict-rules": disableConflictRules,
        recommended,
    },
    rules: {
        dprint,
    },
}
