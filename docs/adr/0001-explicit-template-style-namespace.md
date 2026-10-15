---
status: accepted
---

# Separate styling from semantic bindings

Unprefixed native styling makes ordinary HTML attributes and component props ambiguous when their names also identify CSS properties or VBox style groups. The new native styling interface reserves the `vb-` template namespace for explicit styling, accepting the extra typing in exchange for predictable meaning, while retaining the published polymorphic VBox interface and its existing prop spellings. Ordinary bindings remain semantic; styling objects do not acquire template prefixes, and the semantic/style force options are no longer part of the new interface.

## Considered Options

- Continue inferring styling from CSS property lists, tag-specific semantic lists, and escape-hatch options: rejected because collisions and future platform additions keep meaning dependent on classification rules.
- Require a polymorphic wrapper, a composable, or object-only styling: rejected as the primary authoring interface because native-tag readability and individual style bindings are central to the desired experience.

## Consequences

The template namespace is an intentional public reservation. Grouped styling uses `:vb`, while ordinary argumentless spreads and dynamic attribute names remain Vue bindings even when their runtime keys happen to contain the style prefix; dynamic styling keys belong inside the grouped style object instead. Statically detectable misuse should receive a helpful diagnostic rather than silently changing ordinary Vue binding semantics.

An unfamiliar namespaced property remains styling and receives advisory guidance rather than rejection solely because a CSS dataset does not recognize it. Custom aliases cannot replace built-in condition-group names. Styling completions and diagnostics follow the styling namespace, while informational token previews may also appear on semantic bindings without implying that those bindings are transformed.

Exact spelling normalization, migration diagnostics, and detailed diagnostic severity remain under design review. This records the accepted direction for an unreleased interface, not behavior already implemented by the current compiler.
