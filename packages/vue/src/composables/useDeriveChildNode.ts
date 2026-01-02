import { ref, watchEffect, isVNode, cloneVNode, useSlots, Fragment } from 'vue';
import type { ComputedRef, VNode } from 'vue';
import { __DEV__ } from '@veebox/core';

export const useDeriveChildNode = (
  className: string,
  asChild: ComputedRef<boolean | undefined>,
) => {
  const slots = useSlots();
  const childNode = ref<VNode | null>(null);

  watchEffect(() => {
    if (asChild.value) {
      const children = slots.default?.();

      if (!children || (children.length !== 1 && __DEV__)) {
        console.warn('[VBox]: asChild expects exactly one child element.');
      }

      const child = children?.[0];

      if (!child || (!isVNode(child) && __DEV__)) {
        console.warn('[VBox]: asChild child must be a VNode.');
        return childNode;
      }

      const isFragment = child.type === Fragment;
      const finalChild = (
        isFragment && Array.isArray(child.children) ? child.children[0] : child
      ) as VNode;

      if (!finalChild || (!isVNode(finalChild) && __DEV__)) {
        console.warn('[VBox]: asChild child must be a VNode.');
        return childNode;
      }

      childNode.value = cloneVNode(finalChild, {
        class: [className],
      });
    }
  });

  return childNode;
};
