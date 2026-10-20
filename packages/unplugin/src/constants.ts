import { DefaultAliases, ObjectStyleKeys as CoreObjectStyleKeys } from '@veebox/core';

export const ObjectStyleKeys = new Set(CoreObjectStyleKeys);

export const DefaultAliasKeys = new Set(Object.keys(DefaultAliases));

export const ExplicitStyleKeys = new Set([
  ...ObjectStyleKeys,
  ...DefaultAliasKeys,
]);
