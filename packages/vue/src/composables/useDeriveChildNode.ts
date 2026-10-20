import {
  cloneVNode,
  useSlots,
  Fragment,
  Comment,
  Text,
  unref,
  mergeProps,
  isVNode,
  createTextVNode,
} from 'vue';
import type { FunctionalComponent, MaybeRef, VNode } from 'vue';

const rootsOf = (children: unknown[]): VNode[] =>
  children.flatMap((child) => {
    if (Array.isArray(child)) return rootsOf(child);
    if (child == null || typeof child === 'boolean') return [];
    if (!isVNode(child)) {
      const text = String(child);
      return text.trim() ? [createTextVNode(text)] : [];
    }
    if (child.type === Comment) return [];
    if (child.type === Text && !String(child.children ?? '').trim()) return [];
    if (child.type === Fragment && Array.isArray(child.children))
      return rootsOf(child.children);
    return [child];
  });

/** Evaluate slots during rendering so Vue owns tracking, refs and target changes. */
export const useDeriveChildNode = (className: MaybeRef<string>) => {
  const slots = useSlots();
  const childNode: FunctionalComponent<Record<string, unknown>> = (attrs) => {
    const roots = rootsOf(slots.default?.() ?? []);
    // Vue shape flags 1/2/4 identify an element or functional/stateful component.
    if (roots.length !== 1 || !(roots[0].shapeFlag & 7)) {
      console.warn('[VBox]: asChild expects exactly one root node.');
      return null;
    }
    return cloneVNode(
      roots[0],
      mergeProps(attrs, { class: unref(className) }),
      true,
    );
  };
  childNode.inheritAttrs = false;
  return childNode;
};
