export type StyleObject = Record<string, unknown>;

export type VariantDefinitions = Record<string, Record<string, StyleObject>>;

type VariantValue<V extends VariantDefinitions, K extends keyof V> = Extract<
  keyof V[K],
  string
>;

export type VariantSelection<V extends VariantDefinitions> = {
  [K in keyof V]?: VariantValue<V, K>;
};

export type CompoundCondition<V extends VariantDefinitions> = {
  [K in keyof V]?: VariantValue<V, K> | VariantValue<V, K>[];
};

export type CompoundVariant<V extends VariantDefinitions> = CompoundCondition<V> & {
  styles: StyleObject;
};

export type PvaConfig<V extends VariantDefinitions> = {
  variants: V;
  defaultVariants?: VariantSelection<V>;
  compoundVariants?: ReadonlyArray<CompoundVariant<V>>;
};

export type PvaResolver<V extends VariantDefinitions> = (
  selection?: VariantSelection<V>,
) => StyleObject;

export type VariantProps<T extends (...args: any[]) => any> = NonNullable<
  Parameters<T>[0]
>;

const isObject = (value: unknown): value is StyleObject =>
  value != null && typeof value === 'object' && !Array.isArray(value);

const mergeStyles = (target: StyleObject, source: unknown) => {
  if (!isObject(source)) return target;
  return Object.assign(target, source);
};

const matchesCondition = (
  expected: string | string[] | undefined,
  actual: string | undefined,
): boolean => {
  if (expected == null) return true;
  if (actual == null) return false;

  if (Array.isArray(expected)) {
    return expected.includes(actual);
  }

  return expected === actual;
};

export const pva = <const V extends VariantDefinitions>(
  config: PvaConfig<V>,
): PvaResolver<V> => {
  const variants = config.variants ?? ({} as V);
  const defaults: VariantSelection<V> =
    config.defaultVariants ?? ({} as VariantSelection<V>);
  const compounds = config.compoundVariants ?? [];
  const variantKeys = Object.keys(variants) as Array<keyof V>;

  return (selection = {}) => {
    const resolved = {} as Record<keyof V, string | undefined>;
    const styles: StyleObject = {};

    for (const variantKey of variantKeys) {
      const selected = (selection[variantKey] ??
        defaults[variantKey]) as VariantValue<V, typeof variantKey> | undefined;
      resolved[variantKey] = selected;

      if (!selected) continue;

      const variantMap = variants[variantKey];
      mergeStyles(styles, variantMap[selected]);
    }

    for (const compound of compounds) {
      let matched = true;

      for (const variantKey of variantKeys) {
        const expected = compound[variantKey] as string | string[] | undefined;
        const actual = resolved[variantKey];

        if (!matchesCondition(expected, actual)) {
          matched = false;
          break;
        }
      }

      if (matched) {
        mergeStyles(styles, compound.styles);
      }
    }

    return styles;
  };
};
