# Packed consumer gate

Build the workspace packages, then prepare **local** tarballs in a new folder:

```sh
pnpm --filter '@veebox/*' build
node scripts/release/pack.mjs /tmp/vbox-packed
VBOX_TARBALL_DIR=/tmp/vbox-packed node --test scripts/release/tests/artifacts.test.mjs
node scripts/release/verify-consumer.mjs /tmp/vbox-packed npm
node scripts/release/verify-consumer.mjs /tmp/vbox-packed pnpm
node scripts/release/verify-consumer.mjs /tmp/vbox-packed yarn
```

The consumer runner creates and removes its own temporary project outside the
workspace. `VBOX_KEEP_CONSUMER=1` preserves it for diagnosis. Do not point these
commands at a real application's directory. The packer refuses an existing
output directory. No command publishes packages, creates tags, installs skills,
or deploys an application.

All five VBox dependencies are tarballs, including transitive internal package
overrides. Public imports are checked for accidental monorepo resolution.
Workspace dependencies in demo apps remain unchanged. Third-party tools are
pinned to the versions installed by the repository lockfile; the run prints the
exact Node, package-manager, artifact and tool versions. Registry transitive
resolution is intentionally exercised as a consumer would experience it.

Lifecycle scripts stay enabled. Their PATH excludes global package-manager
binaries, proving npm/Yarn installs do not need pnpm to build VBox. The npm
executable comes from the selected Node installation; pnpm and Yarn executables
are resolved before restricting PATH. Yarn here means **Yarn Classic 1.22.22**,
not an untested claim about Plug'n'Play.

The fixture exercises public module exports, UMD browser globals, generated
config types, Vue typechecking, NodeNext ESM/CJS declarations, the same real Vue
editor service adapter as workspace tests, Vite and webpack production builds,
and SSR/hydration with browser-computed styles. The small shared editor **test
harness** is copied, not package source or dependencies. It resolves every
runtime/editor dependency from the clean consumer.

Install Chromium once with the workspace Playwright CLI, or set
`VBOX_INSTALL_BROWSERS=1`. CI installs its OS dependencies separately. This gate
complements the full multi-engine workspace suite; it does not replace it.
