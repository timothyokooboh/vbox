# Theme Customization

You can pass a theme object to provide custom values for colors, font sizes,
font weight, font family, spacings, etc. This allows you to maintain a
consistent design system across your application without using hardcoded values
:sparkles:.

::: info

When you update the theme configuration, make sure to run `npx vbox-type-gen` to
update the generated types accordingly. This ensures that you get proper
Intellisense support in your IDE for the custom theme values.

Remenber to include `vbox.config.ts` and `vbox.d.ts` in your `tsconfig.json`
file's `include` array if you're using TypeScript.

:::

## Color

You can define custom colors in the `theme.color` object of your
`vbox.config.ts` or `vbox.config.js` file. You can also define different color
values for light and dark modes by using an object with `default` and `dark`
keys.

```ts
// vbox.config.ts
import { defineConfig } from '@veebox/core';

export default defineConfig({
  theme: {
    color: {
      'red-100': '#370617',
      'red-200': {
        default: '#dc2f02',
        dark: '#efefef',
      },
      'red-300': {
        default: '#dc2f02',
        dark: '#ff5733',
      },
      danger: '$color.red-300',
    },
  },
});
```

In the above example, we defined four custom colors: `red-100`, `red-200`,
`red-300`, and `danger`. `red-200` and `red-300` have different values for light
and dark modes. We also created a `danger` color that references `red-300`.

There are two ways to use these custom colors in native elements:

- Prefixing the color name with `cl-`:

```html
<div vb-background-color="cl-red-100" vb-color="cl-danger">
  This box has a red background and danger text color!
</div>
```

- Using CSS custom properties:

```html
<div vb-background-color="var(--color-red-100)" vb-color="var(--color-danger)">
  This box has a red background and danger text color!
</div>
```

::: tip

Providing color values as an object with `default` and `dark` keys allows VBox
to automatically switch between light and dark mode colors based on the current
theme. This can drastically limit your use of the `:vb-dark` binding for manual
dark mode styling :sparkles:.

The dark mode colors will be applied when the `html` element has a `dark` class.

:::

## Font Sizes

You can provide custom font sizes in the `theme.fontSize` object of your
`vbox.config.ts` or `vbox.config.js` file. You can pass arbitrary key-value
pairs to define your font sizes.

```ts
// vbox.config.ts
import { defineConfig } from '@veebox/core';

export default defineConfig({
  theme: {
    fontSize: {
      xs: '0.8rem',
      sm: '1rem',
      md: '1.2rem',
      lg: '1.5rem',
      xl: '2rem',
      heading: '$fontSize.xl',
    },
  },
});
```

You can then use these custom font sizes in native elements like so:

```html
<!-- prefixing the token with fs -->
<div vb-font-size="fs-heading">This box has a heading font size!</div>

<!-- or via CSS custom properties -->
<div vb-font-size="var(--font-size-md)">This box has a medium font size!</div>
```

## Font Weights

You can define custom font weights in the `theme.fontWeight` object of your
`vbox.config.ts` or `vbox.config.js` file. You can specify different font weight
values using arbitrary key-value pairs.

```ts
// vbox.config.ts
import { defineConfig } from '@veebox/core';
export default defineConfig({
  theme: {
    fontWeight: {
      thin: 300,
      normal: 400,
      thick: 700,
    },
  },
});
```

You can then use these custom font weights in native elements like so:

```html
<!-- prefixing the token with fw -->
<div vb-font-weight="fw-thick">This box has a thick font weight!</div>

<!-- or via CSS custom properties -->
<div vb-font-weight="var(--font-weight-thin)">
  This box has a normal font weight!
</div>
```

## Font Families

You can define custom font families in the `theme.fontFamily` object of your
`vbox.config.ts` or `vbox.config.js` file. You can specify different font family
values using arbitrary key-value pairs.

```ts
// vbox.config.ts
import { defineConfig } from '@veebox/core';
export default defineConfig({
  theme: {
    fontFamily: {
      sans: "'Helvetica Neue', Arial, sans-serif",
      serif: "'Times New Roman', Times, serif",
    },
  },
});
```

You can then use these custom font families in native elements like so:

```html
<!-- prefixing the token with ff -->
<div vb-font-family="ff-sans">This box has a sans-serif font family!</div>

<!-- or via CSS custom properties -->
<div vb-font-family="var(--font-family-serif)">
  This box has a serif font family!
</div>
```

## Line Height

You can define custom line heights in the `theme.lineHeight` object of your
`vbox.config.ts` or `vbox.config.js` file. You can specify different line height
values using arbitrary key-value pairs.

```ts
// vbox.config.ts
import { defineConfig } from '@veebox/core';

export default defineConfig({
  theme: {
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.8,
      base: '$lineHeight.normal',
    },
  },
});
```

You can then use these custom line heights in native elements like so:

```html
<!-- prefixing the token with lh -->
<p vb-line-height="lh-relaxed">This has a relaxed line height!</p>

<!-- or via CSS custom properties -->
<div vb-line-height="var(--line-height-tight)">
  This box has a tight line height!
</div>
```

## Letter Spacing

You can define custom letter spacings in the `theme.letterSpacing` object of
your `vbox.config.ts` or `vbox.config.js` file. You can specify different letter
spacing values using arbitrary key-value pairs.

```ts
// vbox.config.ts
import { defineConfig } from '@veebox/core';

export default defineConfig({
  theme: {
    letterSpacing: {
      tight: '-0.05em',
      normal: '0em',
      wide: '0.1em',
      wider: '0.2em',
      base: '$letterSpacing.normal',
    },
  },
});
```

You can then use these custom letter spacings in native elements like so:

```html
<!-- prefixing the token with ls -->
<div vb-letter-spacing="ls-wide">This box has wide letter spacing!</div>

<!-- or via CSS custom properties -->
<div vb-letter-spacing="var(--letter-spacing-tight)">
  This box has tight letter spacing!
</div>
```

## Spacings

You can define custom spacings in the `theme.spacing` object of your
`vbox.config.ts` or `vbox.config.js` file. You can specify different spacing
values using arbitrary key-value pairs.

```ts
// vbox.config.ts
import { defineConfig } from '@veebox/core';
export default defineConfig({
  theme: {
    spacing: {
      xs: '0.5rem',
      sm: '1rem',
      md: '1.5rem',
      lg: '2rem',
      xl: '3rem',
      wide: '$spacing.xl',
    },
  },
});
```

You can then use these custom spacings in native elements like so:

```html
<!-- prefixing the token with sp -->
<div vb-padding="sp-lg">This box has large padding!</div>

<!-- or via CSS custom properties -->
<div vb-margin="var(--spacing-sm)">This box has small margin!</div>
```

## Border Radius

You can define custom border radius values in the `theme.borderRadius` object of
your `vbox.config.ts` or `vbox.config.js` file. You can specify different border
radius values using arbitrary key-value pairs.

```ts
// vbox.config.ts
import { defineConfig } from '@veebox/core';
export default defineConfig({
  theme: {
    borderRadius: {
      none: '0',
      sm: '0.25rem',
      md: '0.5rem',
      lg: '1rem',
      full: '9999px',
      rounded: '$borderRadius.md',
    },
  },
});
```

You can then use these custom border radius values in native elements like so:

```html
<!-- prefixing the token with br -->
<div vb-border-radius="br-lg">This box has large border radius!</div>

<!-- or via CSS custom properties -->
<div vb-border-radius="var(--border-radius-sm)">
  This box has small border radius!
</div>
```

## Box-shadow

You can define custom box-shadow values in the `theme.boxShadow` object of your
`vbox.config.ts` or `vbox.config.js` file. You can specify different box-shadow
values using arbitrary key-value pairs.

```ts
import { defineConfig } from '@veebox/core';

export default defineConfig({
  theme: {
    boxShadow: {
      md: '0px 10px 15px rgba(0,0,0,.5)',
    },
  },
});
```

You can then use these custom box-shadows values in native elements like so:

```html
<!-- prefixing the token with bs -->
<div vb-box-shadow="bs-md">Working with custom box-shadows</div>

<!-- or via CSS custom properties -->
<div vb-box-shadow="var(--box-shadow-md)">Working with custom box-shadows</div>
```

## Z-Index

You can define custom z-index values in the `theme.zIndex` object of your
`vbox.config.ts` or `vbox.config.js` file. You can specify different z-index
values using arbitrary key-value pairs.

```ts
// vbox.config.ts
import { defineConfig } from '@veebox/core';

export default defineConfig({
  theme: {
    zIndex: {
      base: '0',
      dropdown: '1000',
      modal: '2000',
      popover: '3000',
      tooltip: '4000',
    },
  },
});
```

You can then use these custom z-index values in native elements like so:

```html
<!-- prefixing the token with z -->
<div vb-z-index="z-modal">This box has a modal z-index!</div>

<!-- or via CSS custom properties -->
<div vb-z-index="var(--z-index-dropdown)">This box has a dropdown z-index!</div>
```
