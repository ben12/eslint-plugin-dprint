import { disableTypescriptConflictRules } from "./configs/disable-conflict-rules"
import {
    dockerfileRecommended,
    graphqlRecommended,
    jsonRecommended,
    malvaRecommended,
    markdownRecommended,
    markupRecommended,
    sqlRecommended,
    tomlRecommended,
    typescriptRecommended,
    yamlRecommended,
} from "./configs/recommended"
import { dprintRules } from "./rules/dprint"

export = {
    configs: {
        "disable-typescript-conflict-rules": disableTypescriptConflictRules,
        "dockerfile-recommended": dockerfileRecommended,
        "json-recommended": jsonRecommended,
        "markdown-recommended": markdownRecommended,
        "sql-recommended": sqlRecommended,
        "toml-recommended": tomlRecommended,
        "typescript-recommended": typescriptRecommended,
        "malva-recommended": malvaRecommended,
        "markup-recommended": markupRecommended,
        "yaml-recommended": yamlRecommended,
        "graphql-recommended": graphqlRecommended,
    },
    rules: dprintRules,
}
