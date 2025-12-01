<script lang="ts" setup>
import type { VBoxProps, Breakpoints, AliasMap } from "@vbox/core";
import {
  DefaultAliases,
  DefaultBreakpoints,
  parseStyleObject,
  buildCssString,
} from "@vbox/core";

import {
  ref,
  computed,
  watchEffect,
  useAttrs,
  useId,
  inject,
  onBeforeUnmount,
} from "vue";
import { useDeriveChildNode } from "@/composables/useDeriveChildNode";
import {
  classNamePrefixKey,
  aliasKey,
  breakpointsKey,
} from "@/injectionSymbols";

const props = defineProps<VBoxProps>();

const breakpoints = inject(breakpointsKey, DefaultBreakpoints) as Breakpoints;
const aliases = inject<AliasMap>(aliasKey, DefaultAliases);
const classNamePrefix = inject(classNamePrefixKey, "");

const baseClassName = `css-${useId()}`;
const className = classNamePrefix
  ? `${classNamePrefix}-${baseClassName}`
  : baseClassName;
const attrs = useAttrs();
const styleEl = ref<HTMLStyleElement | null>(null);

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
    mediaStyles,
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
    mediaStyles,
    containerQueries,
    customMediaQueries,
    className,
  });

  if (!styleEl.value && typeof document !== "undefined") {
    styleEl.value = document.createElement("style");
    document.head.appendChild(styleEl.value);
  }

  if (styleEl.value) {
    styleEl.value.textContent = cssString;
  }
});

onBeforeUnmount(() => {
  if (styleEl.value?.parentNode) {
    styleEl.value.parentNode.removeChild(styleEl.value);
  }
});
</script>

<template>
  <component v-if="props.asChild" :is="childNode" v-bind="childNode?.props" />

  <component v-else :is="props.is || 'div'" :class="className">
    <slot />
  </component>
</template>
