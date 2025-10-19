# @ben_12/dprint/toml

> Format code with [dprint].

## Rule Details

Run [dprint] to format code.

## Options

```jsonc
{
  "@ben_12/dprint/toml": [
    "error",
    {
      // Use dprint JSON configuration file (default: "dprint.json")
      // It may be created using `dprint init` command
      // See also https://dprint.dev/config/
      "configFile": "dprint.json",
      "config": {
        // The toml configuration of dprint
        // See also https://dprint.dev/plugins/toml/config/
      },
    },
  ],
}
```

[dprint]: https://github.com/dprint/dprint
