---
status: accepted
---

# Preserve reusable style objects

Requiring existing style objects to rename their underscore-prefixed condition keys would prevent straightforward reuse between the published VBox component and the new native styling interface without improving the semantic separation supplied by the template namespace. The new style-only interface therefore accepts compatibility spellings such as `_disabled` and `_2xl` alongside their clean equivalents, without adding template prefixes to object keys. These spellings remain supported rather than receiving deprecation or invalid-key diagnostics merely for being old.

## Composition

The grouped style binding accepts an object or an ordered array of style sources; later sources override earlier contributions within matching contexts, and individual namespaced bindings override grouped declarations regardless of template-attribute position. Matching nested groups preserve unrelated declarations, null and undefined contribute nothing, and false is supported as an omitted conditional array entry. This specifies composition of the sources VBox receives, not a change to how PVA constructs its result.

Compatibility spellings and clean spellings identify the same context before merging. Equivalent keys preserve unrelated nested declarations, with ordinary source order resolving conflicting values rather than giving one spelling special priority. PVA retains its existing public shallow-merge behavior and remains independent of VBox; VBox cannot restore contributions that PVA discarded before returning its object.

## Interface Compatibility

The published VBox component continues to support its existing unprefixed styling and also accepts the new grouped and namespaced styling interface. Explicit new-interface styling overrides matching internal/default contributions without erasing other contexts, giving reusable objects, including recursive condition groups, a common attachment mechanism across native tags and Vue component instances.

Naming compatibility does not imply that arbitrary component props become style declarations or that the current implementation already provides this behavior.
