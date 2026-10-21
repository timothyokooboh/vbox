# VBox Agent Guidance

This directory is the **source** of the prepared `vbox-native` skill, not a
published skill release or a global installation. The builder bundles canonical
documentation and the exact examples exercised by the acceptance app. Do not
install the source folder alone: generated references and compatibility metadata
are part of the installable artifact.

## Prepare and Validate

From the repository root, with workspace packages built:

```sh
STAGING="$(mktemp -d)"
node scripts/build-native-skill.mjs "$STAGING/vbox-native"
pnpm --filter @vbox/acceptance exec node --test tests/skill-artifact.test.mjs
pnpm --filter @vbox/acceptance type-check
pnpm --filter @vbox/acceptance build
pnpm --filter @vbox/acceptance exec playwright test tests/browser/skills.spec.ts
tar -czf "$STAGING/vbox-native.tgz" -C "$STAGING" vbox-native
```

The output directory must be new; the builder refuses to overwrite an existing
installation. It makes no network requests and never changes an agent's
settings. The tarball can be prepared for a future release asset without
publishing it.

## Install and Discover

After reviewing the artifact and its `compatibility.json`, place the
**prepared** `vbox-native` directory in the project's configured skill-discovery
directory. For Codex project discovery, that is
`.agents/skills/vbox-native/SKILL.md` plus its sibling references, examples and
metadata. Review any existing skill before replacing it; the build command
intentionally does not install or update one. Invoke it explicitly as
`$vbox-native`, or let its description match VBox work.

Other agents can consume the same Markdown/frontmatter and relative references;
use their documented project skill directory. Discovery support varies by agent:
this is not a claim of automatic installation in every IDE. No first-party CLI
installer or registry entry has been published yet.

## Version and Update Policy

**Supported published range: none yet.** This draft targets `explicit-native-v1`
in the identified source revision. Existing published packages with the same
source version numbers do not thereby gain native syntax. The manifest records
workspace package versions, canonical document hashes, the source revision, and
whether relevant source files were dirty when prepared. Do not distribute a
working-tree-dirty artifact as a reproducible release.

Before publishing a beta, set and verify the supported prerelease package range
alongside the package-artifact readiness gate. Build from the matching clean
release commit, validate examples against its tarballs, and ship the skill and
packages with the same release notes. Consumers should update the skill with the
packages, not independently track a moving main branch. No released range or
publication is implied by this draft.

## Maintenance

Edit canonical docs under `apps/docs/docs`, not generated `references`. Edit
examples in `apps/acceptance/src/skill-examples`; the artifact copies those
exact files, avoiding a second example implementation. The artifact test checks
local links, document hashes, unchanged code fences, non-overwrite behavior and
Vue compilation. Public type/browser tests cover semantic collisions, PVA,
fragment forwarding and theme-first precedence. Keep those tests and the skill's
routing aligned when the contract changes.

A separate forward-test asks an agent to perform representative consumer tasks
using only the prepared skill and task context. Record the output and failures;
frontmatter validation alone does not establish useful agent behavior.

The prepared beta versions live in `release/native-beta.json`. The builder
checks workspace alignment and records them as `candidatePackageVersions`.
`supportedPublishedRange` remains null while the release is unpublished. This
separates tested candidate compatibility from an assertion that npm already
contains those versions. Rebuild/revalidate both archives if any version
changes.
