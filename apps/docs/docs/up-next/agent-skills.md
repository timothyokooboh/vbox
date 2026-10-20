# Agent Skills

The native API includes a prepared **vbox-native** agent skill. It teaches the
explicit styling boundary, reusable/PVA composition, conditional priority,
component forwarding, SSR integration and accessibility limits using the same
canonical documentation as this site.

::: warning Unreleased

No skill package, registry entry, or supported published version range is
available yet. The draft belongs to the unreleased native-API source revision,
not the currently published polymorphic-only packages.

:::

Maintainers can prepare and validate an artifact using the repository's
[skill preparation guide](https://github.com/timothyokooboh/vbox/blob/main/skills/README.md).
The prepared directory includes `SKILL.md`, self-contained references, tested
Vue examples and `compatibility.json`. The source folder alone is not an
installable artifact because those references are generated from the canonical
docs.

For Codex, place the prepared directory in the project's `.agents/skills`
directory and invoke `$vbox-native`. Other agents should use their documented
project skill-discovery mechanism. Review existing installations before
replacing them; preparation does not change your global settings.

Once a beta is published, choose the skill artifact from the same release and
check its declared package range. Update skill and packages together. A token
preview does not imply compilation, and native HTML does not automatically make
an application WCAG compliant; the skill preserves those boundaries rather than
promising either.
