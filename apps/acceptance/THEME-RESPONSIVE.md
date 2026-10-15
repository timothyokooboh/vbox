# Theme and named responsive contexts - ticket #5

Structured priority compares, low to high:

1. Interaction-state flags (as documented in `INTERACTION-STYLES.md`).
2. Theme qualification: dark-specific over generic in the same interaction set.
3. Named breakpoint flags: sm, md, lg, xl, 2xl.
4. Source order for matching contexts; individual bindings follow grouped sources.

An additional lower-ranked flag refines an otherwise matching set. This preserves
explicit combinations without making the raw number of conditions the priority.
Conditions commute and deduplicate on the same target, not across selectors.

| Active conditions | Dark-hover blue + md-hover green | Plus dark-md-hover orange |
| --- | --- | --- |
| Light, below md, hover | Neither rule | Neither rule |
| Light, md+, hover | Green | Green |
| Dark, below md, hover | Blue | Blue |
| Dark, md+, hover | Blue | Orange |

Generic hover red still beats dark+md resting green. Theme-first is a VBox
contract, not extra CSS selector specificity or wholesale Tailwind parity.

## Breakpoint Configuration

Partial config retains defaults. Config uses `_2xl`; style objects and template
bindings accept both `2xl` and `_2xl`. Values are preserved without converting or
sorting units. For `{ sm: '40rem', md: '640px' }`, md wins when both match.
For `{ sm: '60rem', md: '40rem' }`, md still wins when both match: names define
priority, thresholds define applicability.

Validation rejects non-object config, unknown names, non-string/empty thresholds,
unitless nonzero numbers, percentages, known non-length dimensions, broken math
wrappers, and declaration/block delimiters. Undefined retains the default;
null is invalid config (unlike a null style contribution).

Examples: `48rem`, `50em`, `0`, `-10px`, `calc(40rem + 1px)` and
`min(60rem, 1000px)` retain their authored units. Negative width thresholds are
valid range-query values in [Media Queries Level 4](https://www.w3.org/TR/mediaqueries-4/#mq-min-max);
VBox does not misclassify them as malformed CSS.

This is structural validation, not a second CSS grammar or browser feature test.
Future dimension units and math-function interiors are preserved for the browser
to interpret. For example, a syntactically shaped but unsupported dimension may
never match. There is no browser-only `CSS.supports` decision in this path.

## Evidence

`ThemeResponsive.vue` covers the fixed examples, alternate nesting orders,
dynamic refinement withdrawal, partial config and both 2xl spellings.
`ConfiguredTargets.vue` mounts independent public Vue-plugin consumers to test
tied/mixed/reversed thresholds and repeated registration without shared cache
meaning. Public SSR tests separately verify request/config identity and unchanged
units. Real editor-service tests check recursive theme/breakpoint objects.

Arbitrary query overlap and parent style-owner priority remain follow-up slices.
External CSS, inline styles, important values and arbitrary-selector specificity
still follow the browser cascade.
