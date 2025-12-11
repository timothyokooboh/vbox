# CSS Resets

VBox provides support for css resets via [modern-normalize.css](https://github.com/sindresorhus/modern-normalize). To opt-in to css resets, enable the `cssResets` option in your `vbox.config.js` or `vbox.config.ts` file.

```ts
// vbox.config.ts
import { defineConfig } from '@veebox/core'

export default defineConfig({
  cssResets: true,
})
```

VBox does not enable this option by default because it's possible that your project may already have its own css resets in place.
