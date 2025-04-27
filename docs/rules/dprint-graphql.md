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
      }
    }
  ]
}
```

[dprint]: https://github.com/dprint/dprint
