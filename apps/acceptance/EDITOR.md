# Contextual IntelliSense - ticket #12

The editor tests use the actual Vue language-core and Volar TypeScript service
adapter, with built workspace packages. They issue source-position completion,
hover and diagnostic requests rather than asserting private generated code. The
supported verification baseline is Vue language-core / vue-tsc 3.2.5, Volar
TypeScript adapter 2.4.28 and TypeScript 5.9.3.

## Vocabulary and contexts

- Native HTML, SVG and component instances complete `vb-*` and static camelCase
  names, including aliases and clean/compatibility condition names. No marker is
  required. Ordinary bindings retain their Vue meaning.
- Properties are exhaustive, not capped before prefix filtering. Large files and
  large token families have regressions beyond the former 200-item/location cap.
- Values resolve the property or alias first. Font sizes suggest font-size
  tokens, variables and CSS keywords, not unrelated color or radius tokens.
  Logical border colors and spacing have contextual vocabulary too.
- Bound objects, grouped source arrays, nested interaction/theme/breakpoint,
  media/container and selector groups use each leaf's property. Compound values
  complete the token segment without replacing surrounding CSS.
- Calls such as `:vb="buttonStyles({ tone: 'quiet' })"` retain normal TypeScript
  argument completions. Indexed expressions such as `palette['']` also retain
  their own key suggestions. VBox does not reinterpret PVA variant options as
  styles.
- Empty object positions offer unprefixed style keys, including between existing
  properties. Accepting an empty-value suggestion preserves the surrounding HTML
  or JavaScript quote/backtick delimiters.
- Generated `vbox.d.ts` token and alias augmentation is reused. Keep it included
  in the consumer's tsconfig and regenerate it when its source configuration
  changes; stale generated declarations remain declarations to TypeScript.

## Live editing

Prefer `defineConfig` from `@veebox/core`. It retains literal configuration
types. Generated completion types import that config, so TypeScript's normal
project invalidation refreshes token names, alias names and alias meaning even
when the Vue document has not changed. There is no private file watcher or
IDE-specific extension requirement.

Plain config exports still work. If TypeScript widens an alias target to
`string` or a feature flag to `boolean`, runtime metadata supplies its current
meaning; changes to those widened values refresh on the next Vue document edit.
Use `defineConfig` (or literal-preserving types) for config-only updates. Token
keys remain live when their key types are retained. Broad annotations such as
`const config: VBoxPluginOptions` erase those literal keys too, so they use the
same runtime fallback and refresh on a Vue document edit.

Completions work inside incomplete tags when Vue can recover the template block.
If an unfinished SFC has no recoverable template content at all (for example a
new file containing only `<template><p vb-back`), Vue does not expose a template
mapping yet; close the outer template block to establish that mapping.

## Verification

```sh
pnpm --filter @veebox/core build
pnpm --filter @veebox/volar build
pnpm --filter @vbox/acceptance test:editor
pnpm --filter @vbox/acceptance type-check
```

The shared editor host retains unchanged snapshots, so config-only tests cannot
pass by accidentally regenerating the Vue document. It loads included ambient
declarations as a real consumer does. Tests also protect semantic `translate`,
component props, duplicate entries, generated-name collisions, replacement
spans, and existing legacy component behavior. A separate real `vue-tsc` process
asserts both a successful exit and no plugin exception output: Vue can catch
plugin errors and still exit zero. The plugin ships the full public TypeScript
parser because the CLI-injected, tree-shaken facade is not a complete compiler
API. This does not replace the consumer's own TypeScript language service.

The native-heavy test reports cold, warm-P95 and incremental timings and applies
generous regression budgets (doubled on CI). These are safety checks, not
universal latency claims. Completion unions are shared per document rather than
repeated at every element; only completion mappings inside style ranges are
replaced, not Vue's type verification or semantic expression mappings.

## Live Token Previews - Ticket #13

Previews explain recognized tokens in both style bindings and semantic HTML or
component props. A preview on `title="cl-brand"` does not imply that the
compiler transforms `title`. Tests cover branches, loops, slots, nested
templates, grouped sources and query/selector objects, compound strings, literal
template segments, HTML entities and recoverable incomplete expressions. Unknown
tokens and unrelated scripts, text, comments, event handlers, object keys and
non-string expressions do not acquire a VBox preview. The editor inspects
expression ASTs; it does not run application expressions to discover values.

The hover displays the token's property name and configured value, without an
invented variable declaration or unused-variable warning. Configured colors with
default/dark appearances show both; color references show their CSS variable,
while non-color references resolve as the core does. This is configuration
information, not a browser-computed style or a promise about the currently
active appearance. Circular references are described as unresolved.

With `defineConfig` or equivalent literal-preserving types, adding, changing or
removing tokens, toggling the default theme and editing imported literal
metadata updates previews in the same service without a Vue document edit. The
generated hover types import configuration dependencies rather than capturing
raw JSDoc values indefinitely. The consumer's normal TypeScript project watcher
still needs to observe those files.

Widened config values use a labelled snapshot which refreshes on the next
template edit. The same applies to JavaScript config imports that the consumer
has not included in its TypeScript model (`allowJs` or declarations). Such
imports cause TypeScript's error-any to propagate through conditional types; the
plugin detects that case and explicitly labels the current runtime snapshot
instead. Use typed, literal-preserving metadata for config-only updates. VBox
loads trusted project configuration, as the compiler already does; this is not
an arbitrary-code sandbox.

Run `pnpm --filter @vbox/acceptance test:editor` for hover correctness, exact
public source ranges, suggestion/semantic diagnostics, cross-project isolation
and cold/warm/incremental latency checks. Snapshot fallbacks and the
outer-template recovery limit above are intentional documented limitations, not
reload fixes.
