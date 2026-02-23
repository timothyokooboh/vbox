<script lang="ts" setup>
import type { VBoxProps, Breakpoints, AliasMap } from '@veebox/core';
import {
  DefaultAliases,
  DefaultBreakpoints,
  injectCSS,
} from '@veebox/core';

import { computed, watchEffect, useAttrs, useId, inject, useSSRContext } from 'vue';
import { useDeriveChildNode } from '../composables/useDeriveChildNode';
import { resolveVBoxCss } from '../composables/resolveVBoxStyles';
import {
  classNamePrefixKey,
  aliasKey,
  breakpointsKey,
} from '../injectionSymbols';
import { getSSRCollector, type VBoxSSRContext } from '../ssr';

const props = defineProps<VBoxProps>();
const attrs = useAttrs();

const breakpoints = inject(breakpointsKey, DefaultBreakpoints) as Breakpoints;
const aliases = inject<AliasMap>(aliasKey, DefaultAliases);
const classNamePrefix = inject(classNamePrefixKey, '');

const baseClassName = `css-${useId()}`;
const className = classNamePrefix
  ? `${classNamePrefix}-${baseClassName}`
  : baseClassName;

const childNode = useDeriveChildNode(className, props.asChild);

const propsAndAttrs = computed(() => ({ ...props, ...attrs }));
const isSSR = typeof window === 'undefined';
const ssrContext = isSSR ? (useSSRContext() as VBoxSSRContext) : null;

watchEffect(() => {
  const cssString = resolveVBoxCss({
    styles: propsAndAttrs.value,
    className,
    aliases,
    breakpoints,
  });

  if (isSSR && ssrContext) {
    const collector = getSSRCollector(ssrContext);
    collector.collect(cssString);
  } else {
    injectCSS(cssString);
  }
});
</script>

<template>
  <component v-if="props.asChild" :is="childNode" v-bind="childNode?.props" />

  <component v-else :is="props.is || 'div'" :class="className">
    <slot />
  </component>
</template>
