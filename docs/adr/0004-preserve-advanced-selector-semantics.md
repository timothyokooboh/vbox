---
status: accepted
---

# Preserve advanced selector semantics

Arbitrary selectors can overlap on an element without identifying equivalent styling contexts, and pretending to infer every equivalence or flattening all specificity would change authors' CSS meaning. Keep advanced selectors as an explicit escape hatch with native selector specificity: the parent-override guarantee applies to matching normalized contexts and selectors, while different arbitrary selectors retain normal CSS conflict behavior. Recognized simple equivalents, such as the hover shorthand and a simple hover pseudo entry, share structured styling behavior rather than becoming accidental escape hatches.

## Consequences

The scope of the deterministic structured-styling guarantee must be documented, not advertised as unconditional control over every generated selector. Every selector-list branch must remain correctly scoped, and pseudo-elements and conditional wrappers must retain their intended targets; those are mandatory correctness requirements independent of precedence policy.
