# Native styling beta gate

This branch prepares **unpublished** versions from `native-beta.json`. It does
not publish, tag, install an agent skill, or deploy a demo. Core/Vue use
`2.0.0-beta.0`; compiler/editor/PVA use `0.1.0-beta.0`. Workspace consumers
retain `workspace:*`. Internal package versions are rewritten only when packing.

## Support matrix

The beta toolchain baseline is Node **22.14.0 or newer**. CI exercises 22.14.0
with npm, pnpm 10.14.0 and Yarn Classic 1.22.22, plus Node 24 with npm. The logs
record exact patch/tool versions. This is not certification of older Node, Yarn
Plug'n'Play, every framework, or every IDE extension version.

- Core/Vue expose actual ESM and CJS builds. `require` never selects UMD.
- Core/Vue retain separate UMD browser globals (`VBoxCore`, `VBoxVue`); provide
  Vue's global before the Vue UMD script. Runtime development checks do not
  require a browser `process` polyfill.
- Unplugin/PVA are ESM, including their `require` condition. Synchronous require
  uses the supported Node baseline's ESM interop and returns named exports. They
  are **not** advertised as genuine CJS artifacts or compatible with older
  Node's `require` implementation.
- Volar is CJS. The editor host must satisfy the same Node baseline. Vue -
  Official supplies the Vue integration; VBox is not a standalone LSP.
- Public declarations are checked under Bundler and NodeNext resolution,
  including ESM `.mts` and CJS `.cts` usage with TypeScript 5.9.3.
- Browser runtime support remains bounded by the application's CSS features and
  the multi-engine acceptance evidence, not the Node engine declaration.

## Before the maintainer publishes

1. Review/merge the stacked PRs in order. **Ticket #20's all-package quality
   review is still a required gate**, even if the tarball checks are green.
2. Run the full workspace, type/editor and packed-consumer gates from the exact
   clean release commit. See `scripts/release/README.md`. Inspect tarball file
   lists, hashes, dependency versions and all module/SSR/editor results.
3. Ensure the five package versions match `native-beta.json`; never reuse a
   version that has already been published. A version change requires repacking
   and re-verification, not renaming an existing archive.
4. Build the skill from that same clean source commit. Its compatibility
   manifest identifies exact candidate package versions and source hashes. The
   source folder alone is not the installable artifact. Keep the skill archive
   and package checksums together. No skill registry URL is claimed by this
   branch.
5. Review migration guidance and demo evidence. The native interface is explicit
   `vb-*` / `:vb`; ordinary Vue bindings remain semantic. The published
   polymorphic component remains supported. Browser style registries retain
   unique rules for the page lifetime; this is not bounded-memory certification.
6. Perform manual editor, assistive-technology, device and live-API checks noted
   in the evidence. Automated checks do not certify complete WCAG compliance.
7. Publication, `beta` dist-tag selection, release tagging and demo deployments
   are **separate maintainer actions**. Do not move `latest` to this beta.
   Publish matching dependencies before dependants and verify clean registry
   installs before announcing availability. Existing docs must not imply these
   candidate versions are already downloadable.

## Rollback

Before publication, reverting these PRs is sufficient; no remote runtime state
was changed. After an authorized beta publication, restore the prior beta tag or
direct users to the last verified version, publish a new corrective version, and
keep package/skill versions aligned. Do not overwrite tarballs or assume
unpublishing is safe. Revert/redeploy a demo only through its separately
approved hosting process. Preserve the last stable polymorphic release on
`latest`.

## Evidence

`docs/evidence/package-readiness/README.md` records executed checks and
remaining gates. A prepared artifact or a green workspace run alone is not proof
of clean installation; the consumer gate installs actual tarballs outside this
repository with lifecycle scripts enabled and no workspace aliases.
