import { useSSRContext, type App } from 'vue';
import { getSSRCollector, type VBoxSSRContext } from './ssr';
import { injectCSS, resolveVBoxConfig } from '@veebox/core';
import type { VBoxPluginOptions } from '@veebox/core';
import cssResets from '@veebox/core/styles/resets.css?inline';
import VBox from '@/components/VBox.vue';
import {
  classNamePrefixKey,
  aliasKey,
  breakpointsKey,
} from './injectionSymbols';
import { vboxRuntimeDirective } from './directives/vboxRuntime';

export type AliasStrategy = 'merge' | 'replace';

export default {
  install(app: App<Element>, options?: VBoxPluginOptions) {
    const config = resolveVBoxConfig(options);
    const initialCss = [
      options?.cssResets ? cssResets : '',
      Object.keys(config.theme).length > 0 ? config.themeCss : '',
    ].filter(Boolean).join('\n');
    if (initialCss) {
      if (typeof window !== 'undefined') injectCSS(initialCss);
      else app.mixin({
        beforeCreate() {
          const context = useSSRContext<VBoxSSRContext>();
          if (context) getSSRCollector(context).collect(initialCss);
        },
      });
    }
    app.provide(breakpointsKey, config.breakpoints);
    app.provide(aliasKey, config.aliases);
    app.provide(classNamePrefixKey, config.classNamePrefix);
    app.component('VBox', VBox);
    app.directive('vbox-runtime', vboxRuntimeDirective);
  },
};
