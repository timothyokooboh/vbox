import {
  CSS_REGISTRY_KEY,
  CSS_REGISTRY_LISTENERS_KEY,
  VENDOR_PREFIX_KEY,
} from '../constants';
import { createVendorPrefix } from './vendorPrefix';

export type CssPriority = 'base' | 'override';

type CssRegistry = {
  base: Set<string>;
  override: Set<string>;
};

const createRegistry = (): CssRegistry => ({
  base: new Set<string>(),
  override: new Set<string>(),
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
    };
    typedGlobal[CSS_REGISTRY_KEY] = migrated;
    return migrated;
  }

  return existing;
};

export const cssRegistry = resolveCssRegistry();

const selectLane = (registry: CssRegistry, priority: CssPriority) =>
  priority === 'override' ? registry.override : registry.base;

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
  const baseCss = Array.from(registry.base).join('\n\n');
  const overrideCss = Array.from(registry.override).join('\n\n');

  if (baseCss && overrideCss) {
    return `${baseCss}\n\n${overrideCss}`;
  }

  return baseCss || overrideCss;
};

export type StyleCollector = {
  collect: (css: string, priority?: CssPriority) => void;
  getCss: () => string;
  reset: () => void;
};

export const createStyleCollector = (): StyleCollector => {
  const registry = createRegistry();
  const prefixCache = new Map<string, string>();

  return {
    collect(css: string, priority: CssPriority = 'base') {
      const prefixed = createVendorPrefix(css, prefixCache);
      registerCss(prefixed, registry, priority);
    },
    getCss() {
      return getCss(registry);
    },
    reset() {
      registry.base.clear();
      registry.override.clear();
      prefixCache.clear();
    },
  };
};
