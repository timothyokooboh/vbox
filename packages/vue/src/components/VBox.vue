<script lang="ts" setup>
import type { VBoxProps, Breakpoints, AliasMap } from '@veebox/core';
import {
  DefaultAliases,
  DefaultBreakpoints,
  parseStyleObject,
  buildCssString,
  injectCSS,
} from '@veebox/core';

import { computed, watchEffect, useAttrs, useId, inject } from 'vue';
import { useDeriveChildNode } from '@/composables/useDeriveChildNode';
import {
  classNamePrefixKey,
  aliasKey,
  breakpointsKey,
} from '@/injectionSymbols';

const props = defineProps<VBoxProps>();

const breakpoints = inject(breakpointsKey, DefaultBreakpoints) as Breakpoints;
const aliases = inject<AliasMap>(aliasKey, DefaultAliases);
const classNamePrefix = inject(classNamePrefixKey, '');

const baseClassName = `css-${useId()}`;
const className = classNamePrefix
  ? `${classNamePrefix}-${baseClassName}`
  : baseClassName;
const attrs = useAttrs();

const { childNode } = useDeriveChildNode(
  className,
  computed(() => props.asChild),
);

const styleProps = computed(() => ({ ...props, ...attrs }));

watchEffect(() => {
  const {
    rootStyles,
    rootDarkStyles,
    pseudoStyles,
    selectorBlocks,
    breakpointStyles,
    containerQueries,
    customMediaQueries,
  } = parseStyleObject({
    obj: styleProps.value,
    aliases,
    className,
    breakpoints,
  });

  const cssString = buildCssString({
    rootStyles,
    rootDarkStyles,
    pseudoStyles,
    selectorBlocks,
    breakpointStyles,
    containerQueries,
    customMediaQueries,
    className,
  });

  injectCSS(cssString);
});
</script>

<template>
  <component v-if="props.asChild" :is="childNode" v-bind="childNode?.props" />

  <component v-else :is="props.is || 'div'" :class="className">
    <slot />
  </component>
</template>
