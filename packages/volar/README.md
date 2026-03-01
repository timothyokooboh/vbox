# @veebox/volar

Volar plugin that provides hover previews and completion assistance for VBox style usage inside Vue templates.

Examples:

- `fs="fs-lg"` -> `VBox token preview fs-lg => 1.125rem`
- `border="1px solid cl-brand"` -> hover on `cl-brand`
- `:pseudos="{ ':hover': { bg: 'cl-emerald-400' } }"` -> hover on `cl-emerald-400`
- `color=""` -> token value suggestions (for example `cl-*`)
- `fs=""` -> token value suggestions (for example `fs-*`)
- style attribute names/aliases receive completion support on parsed elements

## Install

```bash
pnpm add -D @veebox/volar
```

## Setup

Add the plugin to your tsconfig / jsconfig used by Vue language tools:

```json
{
  "vueCompilerOptions": {
    "plugins": [
      {
        "name": "@veebox/volar",
        "configPath": "./vbox.config.ts",
        "parseAllComponents": false,
        "forceSemanticAttrs": ["src"],
        "forceStyleAttrs": ["myCustomStyleAttr"]
      }
    ]
  }
}
```

Then restart the TypeScript server in your IDE.
