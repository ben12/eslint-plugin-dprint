# eslint-plugin-dprint

[![GitHub](https://img.shields.io/github/license/ben12/eslint-plugin-dprint)](https://github.com/ben12/eslint-plugin-dprint/blob/master/LICENSE)
[![npm version](https://img.shields.io/npm/v/@ben_12/eslint-plugin-dprint.svg)](https://www.npmjs.com/package/@ben_12/eslint-plugin-dprint)
[![Downloads/month](https://img.shields.io/npm/dm/@ben_12/eslint-plugin-dprint.svg)](http://www.npmtrends.com/@ben_12/eslint-plugin-dprint)\
[![node-current](https://img.shields.io/node/v/%40ben_12%2Feslint-plugin-dprint)](https://nodejs.org)
[![npm peer dependency version (scoped)](https://img.shields.io/npm/dependency-version/%40ben_12%2Feslint-plugin-dprint/peer/eslint)](https://www.npmjs.com/package/eslint)
[![npm peer dependency version (scoped)](https://img.shields.io/npm/dependency-version/%40ben_12%2Feslint-plugin-dprint/@dprint/typescript)](https://www.npmjs.com/package/@dprint/typescript)
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

```
$ npm install -D eslint @ben_12/eslint-plugin-dprint
```

Then install [dprint] plugin for the language to format.

```
$ npm install -D @dprint/dockerfile
$ npm install -D @dprint/json
$ npm install -D @dprint/markdown
$ npm install -D @dprint/toml
$ npm install -D @dprint/typescript
```

## 📖 Usage

Write your ESLint configuration. For example with typescript code:

```js
module.exports = {
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "plugin:@ben_12/dprint/typescript-recommended"],
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

### Available Rules

| Rule                        | Description                                       |
| :-------------------------- | :------------------------------------------------ |
| [@ben_12/dprint/dockerfile] | Format dockerfile code with [@dprint/dockerfile]. |
| [@ben_12/dprint/json]       | Format json code with [@dprint/json].             |
| [@ben_12/dprint/markdown]   | Format markdown code with [@dprint/markdown].     |
| [@ben_12/dprint/toml]       | Format toml code with [@dprint/toml].             |
| [@ben_12/dprint/typescript] | Format typescript code with [@dprint/typescript]. |

### Available Configs

| Config                                                    | Description                                                                                                                  |
| :-------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------- |
| [plugin:@ben_12/dprint/disable-typescript-conflict-rules] | Disable rules where are conflicted with the [@ben_12/dprint/dprint] rule.                                                    |
| [plugin:@ben_12/dprint/dockerfile-recommended]            | Enable the [@ben_12/dprint/dockerfile] rule.                                                                                 |
| [plugin:@ben_12/dprint/json-recommended]                  | Enable the [@ben_12/dprint/json] rule.                                                                                       |
| [plugin:@ben_12/dprint/markdown-recommended]              | Enable the [@ben_12/dprint/markdown] rule.                                                                                   |
| [plugin:@ben_12/dprint/toml-recommended]                  | Enable the [@ben_12/dprint/toml] rule.                                                                                       |
| [plugin:@ben_12/dprint/typescript-recommended]            | Enable the [@ben_12/dprint/typescript] rule along with the [plugin:@ben_12/dprint/disable-typescript-conflict-rules] preset. |

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
[npm]: https://www.npmjs.com/
[@ben_12/dprint/dockerfile]: docs/rules/dprint-dockerfile.md
[@ben_12/dprint/json]: docs/rules/dprint-json.md
[@ben_12/dprint/markdown]: docs/rules/dprint-markdown.md
[@ben_12/dprint/toml]: docs/rules/dprint-toml.md
[@ben_12/dprint/typescript]: docs/rules/dprint-typescript.md
[plugin:@ben_12/dprint/disable-typescript-conflict-rules]: https://github.com/ben12/eslint-plugin-dprint/blob/master/lib/configs/disable-typescript-conflict-rules.ts
[plugin:@ben_12/dprint/recommended]: https://github.com/ben12/eslint-plugin-dprint/blob/master/lib/configs/recommended.ts
