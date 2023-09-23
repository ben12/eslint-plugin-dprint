# eslint-plugin-dprint

[![npm version](https://img.shields.io/npm/v/@ben.12/eslint-plugin-dprint.svg)](https://www.npmjs.com/package/@ben.12/eslint-plugin-dprint)
[![Downloads/month](https://img.shields.io/npm/dm/@ben.12/eslint-plugin-dprint.svg)](http://www.npmtrends.com/@ben.12/eslint-plugin-dprint)

> This is an updated fork of mysticatea/eslint-plugin-dprint. Some things are still being adjusted.

The plugin that runs [dprint] to format code in ESLint.

## 💿 Installation

Use [npm] or a compatible tool.

```
$ npm install -D eslint @ben.12/eslint-plugin-dprint
```

## 📖 Usage

Write your ESLint configuration. For example:

```js
module.exports = {
  extends: ["eslint:recommended", "plugin:@ben12/dprint/recommended"],
  rules: {
    "@ben12/dprint/dprint": [
      "error",
      {
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

| Rule                      | Description                |
| :------------------------ | :------------------------- |
| [@ben12/dprint/dprint] | Format code with [dprint]. |

### Available Configs

| Config                                           | Description                                                                                   |
| :----------------------------------------------- | :-------------------------------------------------------------------------------------------- |
| [plugin:@ben12/dprint/disable-conflict-rules] | Disable rules where are conflicted with the [@ben12/dprint/dprint] rule.                             |
| [plugin:@ben12/dprint/recommended]            | Enable the [@ben12/dprint/dprint] rule along with the [plugin:@ben12/dprint/disable-conflict-rules] preset. |

- Put the [plugin:@ben12/dprint/recommended] or [plugin:@ben12/dprint/disable-conflict-rules] config into the last of your `extends` list in order to ensure disabling conflict rules where came from other base configurations.

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
[npm]: https://www.npmjs.com/
[@ben12/dprint/dprint]: docs/rules/dprint.md
[plugin:@ben12/dprint/disable-conflict-rules]: https://github.com/ben12/eslint-plugin-dprint/blob/master/lib/configs/disable-conflict-rules.ts
[plugin:@ben12/dprint/recommended]: https://github.com/ben12/eslint-plugin-dprint/blob/master/lib/configs/recommended.ts
