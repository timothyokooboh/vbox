import { ref, watchEffect, isVNode, cloneVNode, useSlots } from 'vue';
import type { ComputedRef, VNode } from 'vue';
import { __DEV__ } from '@veebox/core';

export const useDeriveChildNode = (
  className: string,
  asChild: ComputedRef<boolean | undefined>,
) => {
  const slots = useSlots();
  const childNode = ref<VNode | null>(null); // as unknown as Ref<VNode>;

  watchEffect(() => {
    if (asChild.value) {
      const children = slots.default?.();

      if (!children || (children.length !== 1 && __DEV__)) {
        console.warn('[VBox]: asChild expects exactly one child element.');
      }

      const child = children?.[0];

      if (!isVNode(child) && __DEV__) {
        console.warn('[VBox]: asChild child must be a VNode.');
      }

      if (child) {
        childNode.value = cloneVNode(child, {
          class: [className],
        });
      }
    }
  });

  return {
    childNode,
  };
};
