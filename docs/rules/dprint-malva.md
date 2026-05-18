# @ben_12/dprint/malva

> Format code with [dprint].

## Rule Details

Run [dprint] to format code.

## Options

```jsonc
{
  "@ben_12/dprint/malva": [
    "error",
    {
      // Use dprint JSON configuration file (default: "dprint.json")
      // It may be created using `dprint init` command
      // See also https://dprint.dev/config/
      "configFile": "dprint.json",
      "config": {
        // The Malva configuration of dprint
        // See also https://dprint.dev/plugins/malva/config/
      },
    },
  ],
}
```

## Pre-resolved formatter

The plugin can also be given a pre-resolved dprint formatter via ESLint's `settings`. The
`dprint-plugin-malva` package ships only `plugin.wasm` with no JS entrypoint, so the formatter has
to be built from the wasm file directly. See the
[main README](../../README.md#providing-a-pre-resolved-formatter-via-settings) for the full
explanation and the other accepted shapes. Minimal example for this rule:

```mjs
import { createFromBuffer } from "@dprint/formatter";
import fs from "node:fs";

const malvaFormatter = createFromBuffer(
  fs.readFileSync(new URL(import.meta.resolve("dprint-plugin-malva/plugin.wasm"))),
);

export default [{
  settings: {
    "@ben_12/dprint": {
      formatters: { malva: malvaFormatter },
    },
  },
  rules: {
    "@ben_12/dprint/malva": ["error", { config: { /* dprint config */ } }],
  },
}];
```

[dprint]: https://github.com/dprint/dprint
