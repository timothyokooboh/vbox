# @veebox/property-variance-authority

Framework-agnostic variant resolver for style-property objects.

## Install

```bash
pnpm add @veebox/property-variance-authority
```

## Usage

```ts
import { pva } from '@veebox/property-variance-authority';

const buttonVariants = pva({
  variants: {
    variant: {
      solid: {
        color: 'white',
        bg: 'cl-brand',
      },
      outline: {
        color: 'cl-ink',
        bg: 'transparent',
      },
    },
    size: {
      sm: { py: 'sp-2', px: 'sp-4' },
      md: { py: 'sp-3', px: 'sp-5' },
      lg: { py: 'sp-4', px: 'sp-7' },
    },
  },
  defaultVariants: {
    variant: 'solid',
    size: 'md',
  },
  compoundVariants: [
    {
      variant: 'outline',
      size: ['sm', 'md'],
      styles: {
        border: '1px solid currentColor',
      },
    },
  ],
});

const styleProps = buttonVariants({ variant: 'outline', size: 'sm' });
```

`styleProps` is a plain object you can use in any framework/runtime.

## Merge Order

1. Variant styles from defaults + explicit selection
2. Compound variant styles (in array order)

Later merges override earlier keys.

## Types

Use `VariantProps` to infer valid resolver input:

```ts
import type { VariantProps } from '@veebox/property-variance-authority';

type ButtonVariantProps = VariantProps<typeof buttonVariants>;
```
