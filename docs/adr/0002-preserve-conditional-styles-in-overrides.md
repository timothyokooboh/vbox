---
status: accepted
---

# Preserve conditional styling across overrides

Treating every parent-applied declaration as globally stronger would let a parent's base color erase a component's hover, dark, responsive, or container-query behavior. Parent-applied styling instead overrides conflicting internal declarations within the same styling context while preserving other contexts and unrelated declarations; withdrawing an override with a null or undefined value reveals the remaining styling rather than erasing defaults. For the structured styling interface, theme-specific styling has higher style priority than generic responsive styling within the same interaction state. This final theme-first decision supersedes the interim responsive-first choice and aligns with the tested Tailwind conflict; it is a VBox contract, not a claim that theme or media conditions inherently increase CSS selector specificity.

## Consequences

A generic hover declaration remains effective in dark mode unless an applicable dark-hover declaration overrides it. It also takes precedence over a combined dark-and-responsive resting declaration: counting conditions alone does not establish priority, and combining resting conditions does not defeat interaction styling. Supported condition groups compose recursively, with nested conditions all required to match.

For the same style target, supported condition nesting orders express the same conjunction rather than different priority. This equivalence does not cross a selector that changes the target. Within a hover context, dark-plus-hover blue wins in dark mode both below md and at md and above, even when md-plus-hover declares green. In light mode, md-plus-hover green applies at md and above. An explicit dark-plus-md-plus-hover rule can refine both where all its conditions match. Adopting theme-first priority does not change the interaction-over-resting guarantee or adopt Tailwind's entire precedence model.

Built-in shorthand interaction states use the agreed low-to-high order hover, focusWithin, focus, focusVisible, active, disabled for conflicting declarations. When several component callers contribute in the same normalized context, the outermost explicit caller wins; withdrawal reveals the next remaining owner's contribution without removing unrelated classes or styles.

Named breakpoints follow the documented sm, md, lg, xl, 2xl sequence rather than style-object insertion order; configured thresholds determine when each applies. Partial breakpoint configuration merges with defaults, authored CSS units are preserved rather than naively sorted, and the existing `_2xl` configuration spelling is retained for this release. Shorthand/longhand behavior must retain CSS semantics; neither class-list order nor component mount order is a precedence contract.

External styles, inline declarations, and important declarations remain subject to the browser's cascade. Arbitrary-selector behavior is recorded separately in ADR 0004. Detailed comparator mechanics and breakpoint validation diagnostics must be specified and tested against these accepted examples, not inferred from mount order; this record does not claim that the current runtime already implements the agreed behavior.
