/** Type-level editor metadata; keep reference policy aligned with themeConfigParser. */
type Get<T, Key, Fallback = never> = Key extends keyof T
  ? NonNullable<T[Key]>
  : Fallback;

export type VBoxDefaultThemeEnabled<
  Config,
  Snapshot extends boolean = true,
> = 'enableDefaultTheme' extends keyof Config
  ? [Get<Config, 'enableDefaultTheme'>] extends [never]
    ? true
    : boolean extends Get<Config, 'enableDefaultTheme'>
      ? Snapshot
      : Get<Config, 'enableDefaultTheme'> extends false
        ? false
        : true
  : true;

type Vocabulary = { custom: unknown; defaults: unknown; enabled: boolean };
type Custom<V extends Vocabulary, Category> = Get<V['custom'], Category, {}>;
type Lookup<V extends Vocabulary, Category, Key> = Key extends keyof Custom<
  V,
  Category
>
  ? Custom<V, Category>[Key]
  : V['enabled'] extends false
    ? never
    : Get<Get<V['defaults'], Category>, Key>;

type Exists<
  V extends Vocabulary,
  Category,
  Key,
  Fallback,
> = Key extends keyof Custom<V, Category>
  ? string extends keyof Custom<V, Category>
    ? Fallback extends null
      ? false
      : true
    : true
  : V['enabled'] extends false
    ? false
    : Key extends keyof Get<V['defaults'], Category>
      ? true
      : false;

type Snapshot<Value> = Value extends string
  ? `${Value} (snapshot: config value type widened)`
  : Value;

type FormatValue<
  V extends Vocabulary,
  Value,
  Fallback,
  Seen,
  Origin,
> = 0 extends 1 & Value
  ? Snapshot<Fallback>
  : Value extends string
    ? string extends Value
      ? Snapshot<Fallback>
      : Value extends `$${infer Category}.${infer Key}`
        ? Origin extends 'color'
          ? `var(--color-${Key})`
          : [Lookup<V, Category, Key>] extends [never]
            ? Value
            : ResolveValue<V, Category, Key, Fallback, Seen, Origin>
        : Value
    : Value extends { default: infer Default extends string }
      ? string extends Default
        ? Snapshot<Fallback>
        : Value extends { dark: infer Dark extends string }
          ? string extends Dark
            ? Snapshot<Fallback>
            : `${Default} (dark: ${Dark})`
          : Default
      : Fallback;

// Non-color references resolve transitively, even when they pass through colors.
// Only a token originating in the color category uses CSS-variable references.
type ResolveValue<
  V extends Vocabulary,
  Category extends string,
  Key extends string,
  Fallback,
  Seen = never,
  Origin = Category,
> = 0 extends 1 & Lookup<V, Category, Key>
  ? Snapshot<Fallback>
  : `${Category}.${Key}` extends Seen
    ? 'Unresolved circular token reference'
    : [Lookup<V, Category, Key>] extends [never]
      ? Fallback
      : FormatValue<
          V,
          Lookup<V, Category, Key>,
          Fallback,
          Seen | `${Category}.${Key}`,
          Origin
        >;

type Preview<
  V extends Vocabulary,
  Category extends string,
  Key extends string,
  Fallback,
> = {
  exists: Exists<V, Category, Key, Fallback>;
  value: ResolveValue<V, Category, Key, Fallback>;
};

/** Configured information, not browser-computed CSS; widened values use a snapshot. */
export type VBoxTokenPreview<
  Config,
  Defaults,
  Category extends string,
  Key extends string,
  Fallback,
  DefaultsSnapshot extends boolean = true,
> = Preview<
  {
    custom: Get<Config, 'theme', {}>;
    defaults: Defaults;
    enabled: VBoxDefaultThemeEnabled<Config, DefaultsSnapshot>;
  },
  Category,
  Key,
  Fallback
>;
