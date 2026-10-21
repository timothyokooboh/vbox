/** Canonical object-key serialization, not an identity for ordered CSS declarations. */
export const stableStringify = (obj: object): string => {
  const copies = new WeakMap<object, object>();
  return JSON.stringify(
    obj,
    (_key, value: unknown) => {
      if (!value || typeof value !== 'object' || Array.isArray(value))
        return value;
      // Let JSON unbox primitive wrappers (and reject boxed bigint) itself.
      if (
        /^\[object (Number|String|Boolean|BigInt)\]$/.test(
          Object.prototype.toString.call(value),
        )
      ) {
        return value;
      }
      let copy = copies.get(value);
      if (!copy) {
        copy = Object.fromEntries(
          Object.keys(value)
            .sort()
            .map((key) => [key, (value as Record<string, unknown>)[key]]),
        );
        copies.set(value, copy);
      }
      return copy;
    },
    2,
  );
};
