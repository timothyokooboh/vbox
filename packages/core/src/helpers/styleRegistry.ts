import { serializeStyleBundles } from '../styles/bundles';
import type { StyleBundle } from '../styles/types';
import {
  CSS_REGISTRY_KEY,
  CSS_REGISTRY_LISTENERS_KEY,
  VENDOR_PREFIX_KEY,
} from '../constants';
import { createVendorPrefix } from './vendorPrefix';

export type CssPriority = 'prelude' | 'base' | 'override';

type CssRegistry = {
  prelude?: Set<string>;
  base: Set<string>;
  override: Set<string>;
  styles?: Map<string, StyleBundle>;
};

const createRegistry = (): CssRegistry => ({
  prelude: new Set<string>(),
  base: new Set<string>(),
  override: new Set<string>(),
  styles: new Map(),
});

const typedGlobal = globalThis as typeof globalThis & {
  [VENDOR_PREFIX_KEY]?: Map<string, string>;
  [CSS_REGISTRY_KEY]?: CssRegistry | Set<string>;
  [CSS_REGISTRY_LISTENERS_KEY]?: Set<() => void>;
};

export const vendorPrefixes: Map<string, string> =
  typedGlobal[VENDOR_PREFIX_KEY] ??
  (typedGlobal[VENDOR_PREFIX_KEY] = new Map());

const resolveCssRegistry = (): CssRegistry => {
  const existing = typedGlobal[CSS_REGISTRY_KEY];
  if (!existing) {
    const registry = createRegistry();
    typedGlobal[CSS_REGISTRY_KEY] = registry;
    return registry;
  }

  if (existing instanceof Set) {
    const migrated: CssRegistry = {
      base: existing,
      override: new Set<string>(),
      styles: new Map(),
    };
    typedGlobal[CSS_REGISTRY_KEY] = migrated;
    return migrated;
  }

  existing.styles ??= new Map();
  return existing;
};

export const cssRegistry = resolveCssRegistry();

const selectLane = (registry: CssRegistry, priority: CssPriority) => {
  if (priority === 'prelude') return (registry.prelude ??= new Set());
  return priority === 'override' ? registry.override : registry.base;
};

export const registerCss = (
  css: string,
  registry: CssRegistry = cssRegistry,
  priority: CssPriority = 'base',
) => {
  const lane = selectLane(registry, priority);

  if (lane.has(css)) {
    lane.delete(css);
  }

  // maintain css cascade
  lane.add(css);
};

export const getCss = (registry: CssRegistry = cssRegistry) => {
  const preludeCss = Array.from(registry.prelude ?? []).join('\n\n');
  const baseCss = Array.from(registry.base).join('\n\n');
  const overrideCss = Array.from(registry.override).join('\n\n');

  const explicitCss = serializeStyleBundles(registry.styles?.values() ?? []);
  return [preludeCss, baseCss, overrideCss, explicitCss].filter(Boolean).join('\n\n');
};

export const registerStyleBundle = (
  bundle: StyleBundle,
  registry: CssRegistry = cssRegistry,
  cache: Map<string, string> = vendorPrefixes,
) => {
  (registry.styles ??= new Map()).set(bundle.key, {
    ...bundle,
    rules: bundle.rules.map((rule) => ({
      context: rule.context.map((step) => ({ ...step })),
      css: createVendorPrefix(rule.css, cache),
    })),
  });
};

export type StyleCollector = {
  collectStyleBundle: (bundle: StyleBundle) => void;
  collect: (css: string, priority?: CssPriority) => void;
  getCss: () => string;
  reset: () => void;
};

export const createStyleCollector = (): StyleCollector => {
  const registry = createRegistry();
  const prefixCache = new Map<string, string>();

  return {
    collectStyleBundle(bundle) {
      registerStyleBundle(bundle, registry, prefixCache);
    },
    collect(css: string, priority: CssPriority = 'base') {
      const prefixed = createVendorPrefix(css, prefixCache);
      registerCss(prefixed, registry, priority);
    },
    getCss() {
      return getCss(registry);
    },
    reset() {
      registry.prelude?.clear();
      registry.base.clear();
      registry.override.clear();
      registry.styles?.clear();
      prefixCache.clear();
    },
  };
};
