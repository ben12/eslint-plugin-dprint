import { disableTypescriptConflictRules } from "./configs/disable-conflict-rules"
import {
    dockerfileRecommended,
    jsonRecommended,
    malvaRecommended,
    markdownRecommended,
    tomlRecommended,
    typescriptRecommended,
} from "./configs/recommended"
import { dprintRules } from "./rules/dprint"

module.exports = {
    configs: {
        "disable-typescript-conflict-rules": disableTypescriptConflictRules,
        "dockerfile-recommended": dockerfileRecommended,
        "json-recommended": jsonRecommended,
        "markdown-recommended": markdownRecommended,
        "toml-recommended": tomlRecommended,
        "typescript-recommended": typescriptRecommended,
        "malva-recommended": malvaRecommended,
    },
    rules: dprintRules,
}
