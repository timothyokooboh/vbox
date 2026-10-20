# Agent guidance - ticket #18

`skills/vbox-native/SKILL.md` routes consumer tasks to canonical docs. The
builder creates a portable artifact with generated references and the exact Vue
examples from the acceptance app. It does not install, publish, or change global
settings. The draft declares no supported **published** range: workspace
versions alone do not distinguish the new contract from the older npm artifacts.
Version-range alignment is part of the following package-readiness ticket.

## Executable evidence

- The artifact test first failed because the builder did not exist, then passed.
  It prepares a fresh consumer artifact, validates local references, compares
  canonical source hashes and unchanged code fences, compiles the included SFCs,
  and proves an existing destination is not overwritten.
- Public `vue-tsc` passes for all authored and independently generated examples.
- `skills.spec.ts` passed **48/48** cases: four tasks, two implementations, two
  bundlers and three browser engines. Assertions cover DOM semantics and
  computed styles, including SSR hydration for collisions and fragment
  forwarding.
- The skill-creator validator passed on the prepared artifact. Its missing YAML
  dependency was installed only under `/private/tmp/vbox-skill-validation-deps`,
  not in a global Python or agent environment.

Commands from the repository root:

```sh
pnpm --filter @vbox/acceptance exec node --test tests/skill-artifact.test.mjs
pnpm --filter @vbox/acceptance type-check
pnpm --filter @vbox/acceptance build
CI=true pnpm --filter @vbox/acceptance exec playwright test tests/browser/skills.spec.ts
```

## Independent forward-test

A fresh agent received the prepared skill, a matching unreleased-workspace
context, and these tasks without an intended implementation:

1. A native button with browser translation disabled and CSS translation 8px.
2. PVA solid/outline and small/large variants with an independent hover-red
   base.
3. A two-root button/help component, caller resting yellow, internal hover red,
   and explicit semantic/class forwarding to the button only.
4. Generic hover red, md hover green, dark hover blue and optional dark-md-hover
   purple refinement.

The agent wrote only five SFCs in an isolated temporary folder. Those outputs,
with formatting only, are preserved in `apps/acceptance/src/skill-evaluation`
and run beside the shipped examples. The agent consulted compatibility, syntax,
composition, priority and targeting references. It kept semantic and styling
translation separate, kept hover outside PVA composition, explicitly forwarded
`$attrs`, and applied theme-first priority. Actual type and browser checks—not
its self-report—establish the outcomes above.

This is a bounded representative evaluation, not a guarantee about every model,
prompt, editor or accessibility outcome. It does not justify publishing or
global installation. Re-evaluate when the contract or skill routing changes; do
not silently rewrite captured agent outputs to make an evaluation appear
successful.

## Release checks

The prepared source is not directly installable: the builder adds required
references and compatibility metadata. Follow `skills/README.md` for a local
archive and project-scoped discovery instructions. Distribution requires a clean
source commit, verified beta package range and same-release artifact validation.
Full workspace validation and independent review results are recorded below once
complete. No beta, registry entry, release tag or manual deployment was created.

## Review refinements

The first complete workspace gate passed 14/14 tasks, including 935 browser
cases and four intentional CDP-only skips. Independent review then caught a gap
outside the four task examples: the artifact renderer discarded canonical
VitePress source inclusions, removing essential installation/SSR code. A new
artifact regression failed for those missing sources. The builder now expands
them into fenced code, records their hashes, and confines source reads to the
repository. Original code fences remain unchanged.

A browser regression also reproduced a malformed docs warning container. Its
standalone delimiters now survive formatting, and the three-engine check passes.
The refined artifact regression passes. Final full-gate and re-review results
will follow; no previous green run is being used to hide these discovered gaps.
