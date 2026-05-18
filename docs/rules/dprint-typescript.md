# @ben_12/dprint/typescript

> Format code with [dprint].

## Rule Details

Run [dprint] to format code.

## Options

```jsonc
{
  "@ben_12/dprint/typescript": [
    "error",
    {
      // Use dprint JSON configuration file (default: "dprint.json")
      // It may be created using `dprint init` command
      // See also https://dprint.dev/config/
      "configFile": "dprint.json",
      "config": {
        // The TypeScript configuration of dprint
        // See also https://dprint.dev/plugins/typescript/config/
      },
    },
  ],
}
```

## Pre-resolved formatter

The plugin can also be given a pre-resolved dprint formatter via ESLint's `settings`, which is
useful when the dprint plugin packages are not directly require()-able (e.g. bundled configs).
See the [main README](../../README.md#providing-a-pre-resolved-formatter-via-settings) for the full
explanation and the accepted shapes. Minimal example for this rule:

```mjs
import typescriptFormatter from "@dprint/typescript";

export default [{
  settings: {
    "@ben_12/dprint": {
      formatters: { typescript: typescriptFormatter },
    },
  },
  rules: {
    "@ben_12/dprint/typescript": ["error", { config: { /* dprint config */ } }],
  },
}];
```

[dprint]: https://github.com/dprint/dprint
