# Responsive Breakpoints

Configure thresholds in `vbox.config.ts`. Missing or undefined entries retain
defaults; config is not required to repeat the whole table.

```ts
import { defineConfig } from '@veebox/core';
export default defineConfig({
  breakpoints: { md: '50em', _2xl: '100rem' },
});
```

The configuration spelling remains `_2xl` for compatibility. Templates can use
`:vb-2xl` and objects can use `'2xl'` or `_2xl`. Other configured breakpoint
names are not supported in this release; use `mq` for arbitrary queries.

Default thresholds are sm `40rem`, md `48rem`, lg `64rem`, xl `80rem`, and 2xl
`96rem`. Named priority always follows that sequence, not the order of keys in
the object. Authored units are preserved, not guessed as pixel values. Avoid
inverted thresholds unless the named priority is exactly what you intend.

Thresholds must be structurally valid CSS lengths (including supported math
syntax), not numbers, percentages, declaration fragments or time/angle units.
The browser validates the final CSS feature. Full arbitrary queries belong in
`:vb-mq` / `:vb-cq`, including their `@media` / `@container` prefix.

See [responsive styling](../essentials/responsive-design.md) and the exact
[overlap policy](../essentials/style-priority.md#breakpoints-and-arbitrary-queries).
