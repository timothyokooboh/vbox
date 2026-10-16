# Migrating to Explicit Native Styling

This is a coordinated beta migration, not a claim that the current stable
release already accepts the new grammar. Build local packages or install
matching beta versions once available. Back up your work and migrate one
consumer at a time.

| Experimental native interface        | New interface                                 |
| ------------------------------------ | --------------------------------------------- |
| `<p color="red">`                    | `<p vb-color="red">`                          |
| `<button :hover="{ color: 'red' }">` | `<button :vb-hover="{ color: 'red' }">`       |
| Native `v-bind="styles"`             | Native `:vb="styles"`                         |
| Scope wrapper / `vbox` marker        | No marker; only explicitly namespaced styling |
| Ordinary semantic spreads            | Keep ordinary `v-bind`                        |

Remove old `vbox`, `vbox-ignore`/`vboxignore` markers and the
`parseAllComponents`, `forceStyleAttrs`, `forceSemanticAttrs` options. They
belonged to the unreleased inference experiment, not the new public grammar.
Leaving an attribute unprefixed is now how you keep its semantic meaning. No
parallel inference mode is part of the planned beta. A temporary workspace
migration bridge remains during the PR sequence and is removed before the beta
readiness gate.

Do not mechanically prefix every binding. Keep `src`, `href`, `alt`, `class`,
`style`, `type`, `disabled`, ARIA/data attributes, listeners, and legitimate
component props unchanged. Decide explicitly whether width/height are intrinsic
HTML dimensions or CSS dimensions; both can coexist.

Style object keys stay unprefixed. Existing `_disabled`/`_2xl` objects can be
reused without renaming; clean spellings are available too. Prefer `VBoxStyles`
or `VBoxStyleProps` over the broader targeting-inclusive `VBoxProps`. The
published `<VBox is="p" color="red">` and `asChild` APIs remain supported,
including their ordinary style-prop `v-bind` use.

Update the compiler, Vue runtime, core and editor plugin together. Regenerate
`vbox.d.ts`, restart the Vue language service after first installing the plugin,
and run your type checks. Verify component class forwarding, SSR first paint,
hydration, theme changes, responsive states and accessibility rather than only
checking that the build succeeds.
