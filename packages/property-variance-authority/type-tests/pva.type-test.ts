import { pva, type VariantProps } from '../src';

const button = pva({
  variants: {
    variant: {
      solid: { color: 'white' },
      outline: { color: 'black' },
    },
    size: {
      sm: { px: 'sp-2' },
      md: { px: 'sp-4' },
      lg: { px: 'sp-6' },
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
      styles: { border: '1px solid currentColor' },
    },
  ],
});

type ButtonProps = VariantProps<typeof button>;

const validSelection: ButtonProps = {
  variant: 'outline',
  size: 'lg',
};

button(validSelection);
button();

// @ts-expect-error invalid variant key
button({ tone: 'solid' });

// @ts-expect-error invalid variant value for variant
button({ variant: 'ghost' });

// @ts-expect-error invalid variant value for size
button({ size: 'xl' });

pva({
  variants: {
    density: {
      compact: { py: '2px' },
      comfortable: { py: '6px' },
    },
  },
  defaultVariants: {
    // @ts-expect-error default variant must be declared in variant map
    density: 'wide',
  },
});

pva({
  variants: {
    intent: {
      primary: { color: 'white' },
      danger: { color: 'red' },
    },
  },
  compoundVariants: [
    {
      // @ts-expect-error compound condition value must be declared in variant map
      intent: 'warning',
      styles: { color: 'orange' },
    },
  ],
});
