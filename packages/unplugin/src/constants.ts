import { DefaultAliases } from '@veebox/core';

export const ObjectStyleKeys = new Set([
  'mq',
  'cq',
  'dark',
  'declarations',
  'pseudos',
  'hover',
  'focus',
  'focusVisible',
  'focusWithin',
  'active',
  '_disabled',
  'sm',
  'md',
  'lg',
  'xl',
  '_2xl',
]);

export const DefaultAliasKeys = new Set(Object.keys(DefaultAliases));

export const ExplicitStyleKeys = new Set([
  ...ObjectStyleKeys,
  ...DefaultAliasKeys,
]);
