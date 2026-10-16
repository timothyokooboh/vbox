# @veebox/volar

Contextual Vue template completions and design-token previews for VBox.

```vue
<template>
  <button
    type="button"
    vb-font-size="fs-lg"
    vb-border="1px solid cl-brand"
    :vb-hover="{ color: 'cl-brand' }"
  >
    Save
  </button>
</template>
```

## Setup

Install `@veebox/volar` as a development dependency. Enable it in the tsconfig
or jsconfig used by Vue language tools, not in `package.json`:

```json
{
  "vueCompilerOptions": {
    "plugins": ["@veebox/volar"]
  }
}
```

Use Vue - Official in VS Code, or an editor integration supporting Vue language
tools plugins. Restart the Vue/TypeScript service after first enabling the
plugin. It supplies editor assistance; install `@veebox/unplugin` separately to
compile native styling. No completion switches, extra language server or
editor-specific VBox extension are required.

## Completions and previews

- Complete `vb-*` properties, aliases and object groups on HTML, SVG and Vue
  component instances. Static camelCase spellings work too.
- Empty `vb-font-size` / `vb-fs` values suggest font-size tokens, token
  variables and raw CSS values. Color properties, including `vb-border-color`,
  use color vocabulary instead.
- Nested `:vb` / condition / query / selector objects use their leaf property.
  Compound values complete individual token segments.
- Ordinary semantic bindings and PVA function arguments retain Vue/TypeScript
  behavior. The published `<VBox>` interface remains supported.
- Hover recognized tokens for their configured raw values. Hover improvements
  are tracked separately from this completion update.

Use `defineConfig` from `@veebox/core` to preserve literal config types and
enable config-only completion updates without editing the Vue document. Plain
config exports work too; values widened by TypeScript refresh their inferred
meaning on the next Vue document edit. Broad config type annotations also widen
token and alias keys; prefer `defineConfig` for live literal-key tracking.
Included generated `vbox.d.ts` declarations continue to contribute tokens and
aliases; regenerate them after config changes.

## Config locations

By default, config is discovered from the consumer tsconfig directory. For a
nonstandard location:

```json
{
  "vueCompilerOptions": {
    "plugins": [
      {
        "name": "@veebox/volar",
        "rootDir": ".",
        "configPath": "./theme/vbox.config.ts"
      }
    ]
  }
}
```

Optional `aliases: ["brandColor"]` replaces discovered custom alias keys, rather
than merging them. Default aliases still follow the runtime config's alias
strategy. Keep compiler and editor metadata aligned.

Verified with Vue language-core/vue-tsc 3.2.5 and TypeScript 5.9.3. Incomplete
tags work when Vue can recover the outer template block. The repository's
`apps/acceptance/EDITOR.md` documents executable consumer checks and
limitations.
