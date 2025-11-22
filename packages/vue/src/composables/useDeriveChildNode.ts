import { ref, watchEffect, isVNode, cloneVNode, useSlots } from "vue";
import type { ComputedRef, Ref, VNode } from "vue";

export const useDeriveChildNode = (
  className: string,
  asChild: ComputedRef<boolean | undefined>,
) => {
  const slots = useSlots();
  const childNode = ref(null) as unknown as Ref<VNode>;

  watchEffect(() => {
    if (asChild.value) {
      const children = slots.default?.();

      if (!children || children.length !== 1) {
        // todo: show these warnings in development only
        console.warn("[VBox]: asChild expects exactly one child element.");
      }

      const child = children?.[0];

      if (!isVNode(child)) {
        console.warn("[VBox]: asChild child must be a VNode.");
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
