# @ben_12/dprint/graphql

> Format code with [dprint].

## Rule Details

Run [dprint] to format code.

## Options

```jsonc
{
  "@ben_12/dprint/graphql": [
    "error",
    {
      // Use dprint JSON configuration file (default: "dprint.json")
      // It may be created using `dprint init` command
      // See also https://dprint.dev/config/
      "configFile": "dprint.json",
      "config": {
        // The graphql configuration of dprint
        // See also https://dprint.dev/plugins/pretty_graphql/config/
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
import graphqlFormatter from "dprint-plugin-graphql";

export default [{
  settings: {
    "@ben_12/dprint": {
      formatters: { graphql: graphqlFormatter },
    },
  },
  rules: {
    "@ben_12/dprint/graphql": ["error", { config: { /* dprint config */ } }],
  },
}];
```

[dprint]: https://github.com/dprint/dprint
