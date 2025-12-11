# Responsive breakpoints customization

To customize the breakpoints, you can define a `breakpoints` object in your `vbox.config.ts` or `vbox.config.js` file. You can then specify your desired breakpoint values for different screen sizes ranging from `sm` to `2xl`.

```ts
// vbox.config.ts
import { defineConfig } from '@veebox/core'

export default defineConfig({
  breakpoints: {
    sm: '35rem',
    md: '45rem',
    lg: '60rem',
    xl: '75rem',
    '2xl': '90rem',
  },
})
```

Now you can use these custom breakpoints in your `v-box` components for responsive styling.

```html
<v-box :sm="{ backgroundColor: 'lightblue' }" :lg="{ backgroundColor: 'lightcoral' }">
  Responsive Box
</v-box>
```

This div will change its background color based on the screen size according to the custom breakpoints defined in your configuration.
