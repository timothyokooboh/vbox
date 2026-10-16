# Editor and Types

Install the matching `@veebox/volar` development dependency and use **Vue
(Official)** in VS Code, or another integration that supports Vue language-tools
plugins. No separate VBox IDE extension or language server is required for this
beta. The editor plugin does not compile your app; the bundler plugin is
separate.

Add this to the app's `tsconfig.app.json`, `tsconfig.json`, or `jsconfig.json`
used by Vue language tools, **not** `package.json`:

```json
{
  "vueCompilerOptions": { "plugins": ["@veebox/volar"] }
}
```

Restart the Vue/TypeScript language service after first enabling the plugin. Use
your editor's **Trigger Suggest** command inside a style binding. `vb-*`
completes CSS properties, aliases and condition/object groups; empty value
completions are property-aware (`vb-font-size` suggests font-size tokens, not
every color token). Nested literal objects and compound values use the leaf
property/token segment. Ordinary semantic props and PVA function arguments
retain Vue/TypeScript behavior.

## Config and generated types

Use `defineConfig` from core to preserve literal metadata. Compiler/editor
config discovery is automatic for a conventional project root; nonstandard
layouts can specify the same location explicitly:

```json
{
  "vueCompilerOptions": {
    "plugins": [
      {
        "name": "@veebox/volar",
        "configPath": "./theme/vbox.config.ts"
      }
    ]
  }
}
```

By default, editor discovery uses the TypeScript project directory. An explicit
`rootDir` overrides it; use an absolute path in generated configurations, since
a relative override resolves from the language-service process working
directory. Nuxt should configure `typescript.tsConfig.vueCompilerOptions` in
`nuxt.config.ts`, rather than editing `.nuxt` output. See the
[tested Nuxt setup](./ssr-support.md#nuxt).

An explicit `aliases` array replaces discovered custom alias keys, not merges
with them; it does not define runtime mappings. Keep it aligned with the
compiler if you use this escape hatch. Default aliases still follow the runtime
strategy.

Run the public CLI after theme/alias changes:

```sh
npx vbox-type-gen
# For a nonstandard location:
npx vbox-type-gen --root . --config ./theme/vbox.config.ts
```

Include `vbox.d.ts` and the config in the app's TypeScript project. Generated
augmentations support reusable TypeScript objects and also contribute editor
vocabulary. Use `VBoxStyles` for recursive style-only objects, or keep existing
`VBoxStyleProps`. Do not widen Vue's native HTML attributes to all CSS
properties: that would recreate semantic collisions such as HTML versus CSS
`translate`.

## Token previews

Hover tokens such as `cl-brand`, including compound strings like
`1px solid cl-brand`, nested pseudo/query objects, and elements under `v-if` or
`v-for`. Literal config values and typed imports update without reloading the
IDE. Previews show configured/default/dark values and references, not
browser-computed styles. Recognized tokens can also be previewed on semantic
component props; this is informational and does not mean those props are
transformed.

Widened config values, or untyped JavaScript config imports outside the
TypeScript model, use a labelled snapshot refreshed by template edits. Prefer
`defineConfig` and typed imports (or appropriate `allowJs`) for live dependency
tracking. Dynamic expressions such as `:vb-color="someVariable"` are not
executed to guess a preview. Configuration is trusted project code; ordinary
template application code is never executed for token inspection.

Verified with Vue language-core/vue-tsc 3.2.5 and TypeScript 5.9.3. Incomplete
Vue markup requires a recoverable outer template block. Report a minimal
reproduction if suggestions disagree with runtime config; do not add another
grammar or IDE completion override to work around it.
