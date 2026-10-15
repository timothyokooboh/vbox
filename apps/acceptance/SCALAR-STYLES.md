# Explicit scalar styling - ticket #8

```vue
<input
  translate="no"
  width="12"
  vb-translate="8px 0"
  :vb-width="width + 'px'"
/>
```

The native attributes remain native. The CSS translation and width are separate
style declarations. `NativeScalar.vue` demonstrates HTML, SVG, camel/kebab
names, reactivity, scoped expressions, semantic spreads and component props.
Run:

```sh
pnpm --filter @vbox/acceptance test
pnpm --filter @vbox/acceptance type-check
pnpm --filter @vbox/acceptance test:editor
pnpm --filter @veebox/unplugin test
```

## Current scalar contract

- `vb-color`, `:vb-color`, `v-bind:vb-color` and Vue's static-name camel
  spelling `vbColor` identify styling. Merely similar names such as `vbcolor`,
  `vbox-color` and `data-vb-color` remain semantic. The namespace is stripped
  exactly once.
- Unknown namespaced CSS is still styling, not a semantic fallback. Browser CSS
  validation can ignore declarations the browser does not implement.
- Object-group strings are rejected with guidance to expression bindings.
  Built-in groups come from core metadata, including compatibility spellings.
  Recursive composition and grouped `:vb` attach in subsequent slices.
- Empty/malformed names, duplicate normalized names, style binding modifiers,
  and non-rendering template/slot targets receive compiler errors. Prefer the
  explicit camel spelling over `.camel`; `.prop`/`.attr` do not apply to CSS.
- `v-pre` content is literal. Vue virtual subrequests and dependency SFCs are
  not processed as authored templates.
- Ordinary `v-bind` and dynamic argument names stay semantic, even with runtime
  `vb-*` keys. Detectable literal mistakes get a warning pointing to `:vb`.
- Existing classes, styles, refs and listeners are preserved. When a semantic
  spread is present, Vue's `mergeProps` composes its class with the generated
  class without feeding the semantic properties into the style engine.
- Generated setup imports/bindings avoid consumer identifiers. Authored script
  statements, style blocks and custom-block contents are preserved; an internal
  setup prelude is added. A normal Options API script keeps its default export.
- External `script src` integration currently receives an explicit limitation
  error; ticket #9 owns wider build/edit integration. This stack is unreleased.

## Architecture and evidence

The explicit path uses Vue's SFC/template AST and source locations. Vite and
webpack call that same transform and deliver its diagnostics/source maps. The
render-time Vue helper returns ordinary class bindings, not a directive
mutation. This fixed the reproduced SSR mismatch between authored and generated
classes; production hydration diagnostics are enabled in **both** browser
drivers.

Red/green cases include missing scalar CSS, literal object misuse, v-pre,
modifiers, duplicate/invalid names, unsupported targets, literal spread
guidance, virtual subrequests, and consumer directive-name collisions. Browser
checks also cover events/ref behavior, reactive expressions evaluated once,
native SVG fill, ordinary runtime-prefixed keys and semantic component props.
Public editor tests prove native `translate="no"` is accepted and
`translate="20px"` is still rejected, independently of `vb-translate`. Token
quick-info retains its source mapping.

The unpublished inference path remains only for files not using the explicit
namespace during this internal expansion. No user-facing mode was added. The
cutover ticket #14 removes that bridge after consumer migration. This is not the
final global semantic-isolation gate or a completed release.
