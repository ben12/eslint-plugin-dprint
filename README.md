# eslint-plugin-dprint

[![GitHub](https://img.shields.io/github/license/ben12/eslint-plugin-dprint)](https://github.com/ben12/eslint-plugin-dprint/blob/master/LICENSE)
[![npm version](https://img.shields.io/npm/v/@ben_12/eslint-plugin-dprint.svg)](https://www.npmjs.com/package/@ben_12/eslint-plugin-dprint)
[![Downloads/month](https://img.shields.io/npm/dm/@ben_12/eslint-plugin-dprint.svg)](http://www.npmtrends.com/@ben_12/eslint-plugin-dprint)\
[![node-current](https://img.shields.io/node/v/%40ben_12%2Feslint-plugin-dprint)](https://nodejs.org)
[![npm peer dependency version (scoped)](https://img.shields.io/npm/dependency-version/%40ben_12%2Feslint-plugin-dprint/peer/eslint)](https://www.npmjs.com/package/eslint)
![npm bundle size](https://img.shields.io/bundlephobia/min/%40ben_12%2Feslint-plugin-dprint)\
[![Build Status](https://github.com/ben12/eslint-plugin-dprint/workflows/CI/badge.svg)](https://github.com/ben12/eslint-plugin-dprint/actions)
[![codecov](https://codecov.io/gh/ben12/eslint-plugin-dprint/branch/master/graph/badge.svg)](https://codecov.io/gh/ben12/eslint-plugin-dprint)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=ben12_eslint-plugin-dprint&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=ben12_eslint-plugin-dprint)
[![Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=ben12_eslint-plugin-dprint&metric=code_smells)](https://sonarcloud.io/dashboard?id=ben12_eslint-plugin-dprint)
[![Quality Gate](https://sonarcloud.io/api/project_badges/measure?project=ben12_eslint-plugin-dprint&metric=vulnerabilities)](https://sonarcloud.io/dashboard?id=ben12_eslint-plugin-dprint)

> This is an updated fork of mysticatea/eslint-plugin-dprint. Some things are still being adjusted.

The plugin that runs [dprint] to format code in ESLint.

## 💿 Installation

Use [npm] or a compatible tool.

```sh
$ npm install -D eslint @ben_12/eslint-plugin-dprint
```

Then install [dprint] plugin for the language to format.

```sh
$ npm install -D @dprint/dockerfile
$ npm install -D @dprint/json
$ npm install -D @dprint/markdown
$ npm install -D @dprint/toml
$ npm install -D @dprint/typescript
$ npm install -D dprint-plugin-malva
$ npm install -D dprint-plugin-markup
$ npm install -D dprint-plugin-yaml
$ npm install -D dprint-plugin-graphql
```

[![npm peer dependency version (scoped)](https://img.shields.io/npm/dependency-version/%40ben_12%2Feslint-plugin-dprint/peer/%40dprint%2Fdockerfile)](https://dprint.dev/plugins/dockerfile/)
[![npm peer dependency version (scoped)](https://img.shields.io/npm/dependency-version/%40ben_12%2Feslint-plugin-dprint/peer/%40dprint%2Fjson)](https://dprint.dev/plugins/json/)
[![npm peer dependency version (scoped)](https://img.shields.io/npm/dependency-version/%40ben_12%2Feslint-plugin-dprint/peer/%40dprint%2Fmarkdown)](https://dprint.dev/plugins/markdown/)
[![npm peer dependency version (scoped)](https://img.shields.io/npm/dependency-version/%40ben_12%2Feslint-plugin-dprint/peer/%40dprint%2Ftoml)](https://dprint.dev/plugins/toml/)
[![npm peer dependency version (scoped)](https://img.shields.io/npm/dependency-version/%40ben_12%2Feslint-plugin-dprint/peer/%40dprint%2Ftypescript)](https://dprint.dev/plugins/typescript/)
[![npm peer dependency version (scoped)](https://img.shields.io/npm/dependency-version/%40ben_12%2Feslint-plugin-dprint/peer/dprint-plugin-malva)](https://dprint.dev/plugins/malva/)
[![npm peer dependency version (scoped)](https://img.shields.io/npm/dependency-version/%40ben_12%2Feslint-plugin-dprint/peer/dprint-plugin-markup)](https://dprint.dev/plugins/markup_fmt/)
[![npm peer dependency version (scoped)](https://img.shields.io/npm/dependency-version/%40ben_12%2Feslint-plugin-dprint/peer/dprint-plugin-yaml)](https://dprint.dev/plugins/pretty_yaml/)
[![npm peer dependency version (scoped)](https://img.shields.io/npm/dependency-version/%40ben_12%2Feslint-plugin-dprint/peer/dprint-plugin-graphql)](https://dprint.dev/plugins/pretty_graphql/)

## 📖 Usage

Write your ESLint configuration. For example with typescript code:

```mjs
import { defineConfig } from "eslint/config";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import dprint from "@ben_12/eslint-plugin-dprint";

module.exports = defineConfig([
  {
    files: ["**/*.ts", "**/*.js"],

    languageOptions: {
        parser: tsParser
    },

    plugins: {
        "@typescript-eslint": tsPlugin,
        "@ben_12/dprint": dprint,
    },

    rules: {
      ...tsPlugin.configs["eslint-recommended"].rules,
      ...tsPlugin.configs["recommended"].rules,
      ...tsPlugin.configs["strict"].rules,
      ...dprint.configs["typescript-recommended"].rules
      "@ben_12/dprint/typescript": [
        "error",
        {
          // Use dprint JSON configuration file (default: "dprint.json")
          // It may be created using `dprint init` command
          // See also https://dprint.dev/config/
          configFile: "dprint.json",
          config: {
            // The TypeScript configuration of dprint
            // See also https://dprint.dev/plugins/typescript/config/
          },
        },
      ],
    },
  },
]);
```

For legacy eslint (eslintrc configuration),

```js
module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@ben_12/dprint/typescript-recommended",
  ],
  rules: {
    "@ben_12/dprint/typescript": [
      "error",
      {
        // Use dprint JSON configuration file (default: "dprint.json")
        // It may be created using `dprint init` command
        // See also https://dprint.dev/config/
        configFile: "dprint.json",
        config: {
          // The TypeScript configuration of dprint
          // See also https://dprint.dev/plugins/typescript/config/
        },
      },
    ],
  },
};
```

Then run ESLint with `--fix`!

For unparsed eslint file like markdown or dockerfile, you can use [@ben_12/eslint-simple-parser](https://www.npmjs.com/package/@ben_12/eslint-simple-parser) as parser.

```mjs
import { defineConfig } from "eslint/config";
import dprint from "@ben_12/eslint-plugin-dprint";
import simpleParser from "@ben_12/eslint-simple-parser";

export default defineConfig([
  {
    files: ["**/*.md"],
    plugins: {
        "@ben_12/dprint": dprint,
    },
    languageOptions: {
        parser: simpleParser,
    },
    rules: dprint.configs["markdown-recommended"].rules,
  },
]);
```

### Available Rules

| Rule                        | Description                                        |
| :-------------------------- | :------------------------------------------------- |
| [@ben_12/dprint/dockerfile] | Format dockerfile code with [@dprint/dockerfile].  |
| [@ben_12/dprint/json]       | Format json code with [@dprint/json].              |
| [@ben_12/dprint/markdown]   | Format markdown code with [@dprint/markdown].      |
| [@ben_12/dprint/toml]       | Format toml code with [@dprint/toml].              |
| [@ben_12/dprint/typescript] | Format typescript code with [@dprint/typescript].  |
| [@ben_12/dprint/malva]      | Format css/scss/less/sass code with [malva].       |
| [@ben_12/dprint/markup]     | Format HTML/Vue/Svelte/... code with [markup_fmt]. |
| [@ben_12/dprint/yaml]       | Format YAML code with [pretty_yaml].               |
| [@ben_12/dprint/graphql]    | Format GraphQL code with [pretty_graphql].         |

### Available Configs

| Config                                                    | Description                                                                                                                  |
| :-------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------- |
| [plugin:@ben_12/dprint/disable-typescript-conflict-rules] | Disable rules where are conflicted with the [@ben_12/dprint/typescript] rule.                                                |
| [plugin:@ben_12/dprint/dockerfile-recommended]            | Enable the [@ben_12/dprint/dockerfile] rule.                                                                                 |
| [plugin:@ben_12/dprint/json-recommended]                  | Enable the [@ben_12/dprint/json] rule.                                                                                       |
| [plugin:@ben_12/dprint/markdown-recommended]              | Enable the [@ben_12/dprint/markdown] rule.                                                                                   |
| [plugin:@ben_12/dprint/toml-recommended]                  | Enable the [@ben_12/dprint/toml] rule.                                                                                       |
| [plugin:@ben_12/dprint/typescript-recommended]            | Enable the [@ben_12/dprint/typescript] rule along with the [plugin:@ben_12/dprint/disable-typescript-conflict-rules] preset. |
| [plugin:@ben_12/dprint/malva-recommended]                 | Enable the [@ben_12/dprint/malva] rule.                                                                                      |
| [plugin:@ben_12/dprint/markup-recommended]                | Enable the [@ben_12/dprint/markup] rule.                                                                                     |
| [plugin:@ben_12/dprint/yaml-recommended]                  | Enable the [@ben_12/dprint/yaml] rule.                                                                                       |
| [plugin:@ben_12/dprint/graphql-recommended]               | Enable the [@ben_12/dprint/graphql] rule.                                                                                    |

- Put the [plugin:@ben_12/dprint/recommended] or [plugin:@ben_12/dprint/disable-conflict-rules] config into the last of your `extends` list in order to ensure disabling conflict rules where came from other base configurations.

## 📰 Changelog

See [GitHub Releases](https://github.com/ben12/eslint-plugin-dprint/releases).

## ❤️ Contributing

Welcome contributing!

Please use GitHub's Issues/PRs.

### Development Tools

- `npm test` ... Run tests. It generates code coverage into `coverage` directory.
- `npm run watch` ... Run tests when files are edited.
- `npm version <patch|minor|major>` ... Bump a new version.

[dprint]: https://github.com/dprint/dprint
[@dprint/dockerfile]: https://github.com/dprint/dprint-plugin-dockerfile
[@dprint/json]: https://github.com/dprint/dprint-plugin-json
[@dprint/markdown]: https://github.com/dprint/dprint-plugin-markdown
[@dprint/toml]: https://github.com/dprint/dprint-plugin-toml
[@dprint/typescript]: https://github.com/dprint/dprint-plugin-typescript
[malva]: https://github.com/g-plane/malva
[markup_fmt]: https://github.com/g-plane/markup_fmt
[pretty_yaml]: https://github.com/g-plane/pretty_yaml
[pretty_graphql]: https://github.com/g-plane/pretty_graphql
[npm]: https://www.npmjs.com/
[@ben_12/dprint/dockerfile]: docs/rules/dprint-dockerfile.md
[@ben_12/dprint/json]: docs/rules/dprint-json.md
[@ben_12/dprint/markdown]: docs/rules/dprint-markdown.md
[@ben_12/dprint/toml]: docs/rules/dprint-toml.md
[@ben_12/dprint/typescript]: docs/rules/dprint-typescript.md
[@ben_12/dprint/malva]: docs/rules/dprint-malva.md
[@ben_12/dprint/markup]: docs/rules/dprint-markup.md
[@ben_12/dprint/yaml]: docs/rules/dprint-yaml.md
[@ben_12/dprint/graphql]: docs/rules/dprint-graphql.md
[plugin:@ben_12/dprint/disable-typescript-conflict-rules]: https://github.com/ben12/eslint-plugin-dprint/blob/master/lib/configs/disable-typescript-conflict-rules.ts
[plugin:@ben_12/dprint/dockerfile-recommended]: https://github.com/ben12/eslint-plugin-dprint/blob/master/lib/configs/recommended.ts#L3
[plugin:@ben_12/dprint/json-recommended]: https://github.com/ben12/eslint-plugin-dprint/blob/master/lib/configs/recommended.ts#L10
[plugin:@ben_12/dprint/markdown-recommended]: https://github.com/ben12/eslint-plugin-dprint/blob/master/lib/configs/recommended.ts#L17
[plugin:@ben_12/dprint/toml-recommended]: https://github.com/ben12/eslint-plugin-dprint/blob/master/lib/configs/recommended.ts#L24
[plugin:@ben_12/dprint/typescript-recommended]: https://github.com/ben12/eslint-plugin-dprint/blob/master/lib/configs/recommended.ts#L31
[plugin:@ben_12/dprint/malva-recommended]: https://github.com/ben12/eslint-plugin-dprint/blob/master/lib/configs/recommended.ts#L39
[plugin:@ben_12/dprint/markup-recommended]: https://github.com/ben12/eslint-plugin-dprint/blob/master/lib/configs/recommended.ts#L46
[plugin:@ben_12/dprint/yaml-recommended]: https://github.com/ben12/eslint-plugin-dprint/blob/master/lib/configs/recommended.ts#L53
[plugin:@ben_12/dprint/graphql-recommended]: https://github.com/ben12/eslint-plugin-dprint/blob/master/lib/configs/recommended.ts#L60
