# Custom Aliases

VBox allows you to define your own custom aliases for CSS properties in addition to the default aliases provided. This can help streamline your styling process by using shorter or more intuitive names for frequently used properties.

```ts
// vbox.config.ts
import { defineConfig } from '@veebox/core'

export default defineConfig({
  aliases: {
    strategy: 'merge', // or 'replace' to override default aliases
    values: {
      mTop: 'marginBlockStart',
      mBottom: 'marginBlockEnd',
    },
  },
})
```

In the example above, we define two custom aliases: `mTop` for `marginBlockStart` and `mBottom` for `marginBlockEnd`. The `strategy` option determines whether to merge these custom aliases with the default ones or to replace them entirely. If you choose `merge`, both default and custom aliases will be available. If you choose `replace`, you won't have access to the default aliases anymore.

You can then use these custom aliases in your `v-box` components like so:

```html
<v-box m-top="1rem" m-bottom="2rem"> Custom margin using aliases! </v-box>
```

## Intellisense Support

When you run `npx vbox-type-gen`, the vbox cli will automatically pick up your custom aliases defined in the `vbox.config.ts` file and update the generated types accordingly. This ensures that you get proper Intellisense support in your IDE for both default and custom aliases :ok_hand:

::: info
Make sure that `vbox.config.js` or `vbox.config.ts` is located at the root of your Vue.js project.

And if you're using TypeScript, ensure that both `vbox.config.ts` and `vbox.d.ts` are included in your `tsconfig.json` file's `include` array.

`vbox.d.ts` is the generated types file created when you run `npx vbox-type-gen` to update the types based on your custom configuration. This ensure proper Intellisense support in your IDE.
:::
