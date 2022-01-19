# eslint-plugin-dprint

[![npm version](https://img.shields.io/npm/v/@phaphoso/eslint-plugin-dprint.svg)](https://www.npmjs.com/package/@phaphoso/eslint-plugin-dprint)
[![Downloads/month](https://img.shields.io/npm/dm/@phaphoso/eslint-plugin-dprint.svg)](http://www.npmtrends.com/@phaphoso/eslint-plugin-dprint)

> This is an updated fork of mysticatea/eslint-plugin-dprint. Some things are still being adjusted.

The plugin that runs [dprint] to format code in ESLint.

## 💿 Installation

Use [npm] or a compatible tool.

```
$ npm install -D eslint @phaphoso/eslint-plugin-dprint
```

- `@phaphoso/eslint-plugin-dprint` contains [typescript-0.62.0.wasm] because that will be not likely published to [npm] repository.

## 📖 Usage

Write your ESLint configuration. For example:

```js
module.exports = {
  extends: ["eslint:recommended", "plugin:@phaphoso/dprint/recommended"],
  rules: {
    "@phaphoso/dprint/dprint": [
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
| [@phaphoso/dprint/dprint] | Format code with [dprint]. |

### Available Configs

| Config                                           | Description                                                                                   |
| :----------------------------------------------- | :-------------------------------------------------------------------------------------------- |
| [plugin:@phaphoso/dprint/disable-conflict-rules] | Disable rules where are conflicted with the [@phaphoso/dprint/dprint] rule.                             |
| [plugin:@phaphoso/dprint/recommended]            | Enable the [@phaphoso/dprint/dprint] rule along with the [plugin:@phaphoso/dprint/disable-conflict-rules] preset. |

- Put the [plugin:@phaphoso/dprint/recommended] or [plugin:@phaphoso/dprint/disable-conflict-rules] config into the last of your `extends` list in order to ensure disabling conflict rules where came from other base configurations.

## 📰 Changelog

See [GitHub Releases](https://github.com/rmobis/eslint-plugin-dprint/releases).

## ❤️ Contributing

Welcome contributing!

Please use GitHub's Issues/PRs.

### Development Tools

- `npm test` ... Run tests. It generates code coverage into `coverage` directory.
- `npm run watch` ... Run tests when files are edited.
- `npm version <patch|minor|major>` ... Bump a new version.

[dprint]: https://github.com/dprint/dprint
[npm]: https://www.npmjs.com/
[typescript-0.62.0.wasm]: lib/dprint/typescript-0.62.0.wasm
[@phaphoso/dprint/dprint]: docs/rules/dprint.md
[plugin:@phaphoso/dprint/disable-conflict-rules]: https://github.com/rmobis/eslint-plugin-dprint/blob/master/lib/configs/disable-conflict-rules.ts
[plugin:@phaphoso/dprint/recommended]: https://github.com/rmobis/eslint-plugin-dprint/blob/master/lib/configs/recommended.ts
