import {
  ref,
  watchEffect,
  isVNode,
  cloneVNode,
  useSlots,
  Fragment,
  unref,
} from 'vue';
import type { MaybeRef, VNode } from 'vue';
import { __DEV__ } from '@veebox/core';

export const useDeriveChildNode = (
  className: string,
  asChild: MaybeRef<boolean | undefined>,
) => {
  const slots = useSlots();
  const childNode = ref<VNode | null>(null);
  const message = '[VBox]: asChild expects exactly one root node.';

  watchEffect(() => {
    const isAsChild = unref(asChild);

    // Reset when asChild is false
    if (!isAsChild) {
      childNode.value = null;
      return childNode;
    }

    const slotChildren = slots.default?.();

    // asChild requires exactly one root node
    if (
      !slotChildren ||
      (Array.isArray(slotChildren) && slotChildren.length !== 1 && __DEV__)
    ) {
      console.warn(message);
      return childNode;
    }

    let child = slotChildren[0];

    // Unwrap fragment (e.g slots)
    if (child.type === Fragment) {
      const fragmentChildren = child.children;

      if (!Array.isArray(fragmentChildren) || fragmentChildren.length !== 1) {
        __DEV__ && console.warn(message);
        return;
      }

      child = fragmentChildren[0] as VNode;
    }

    // asChild must be a VNode
    if (!isVNode(child)) {
      __DEV__ && console.warn(message);
      return;
    }

    childNode.value = cloneVNode(child, {
      class: [className],
    });
  });

  return childNode;
};
