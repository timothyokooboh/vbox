import type { App } from 'vue';
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
    if (Object.keys(config.theme).length > 0) injectCSS(config.themeCss);
    if (options?.cssResets) injectCSS(cssResets);
    app.provide(breakpointsKey, config.breakpoints);
    app.provide(aliasKey, config.aliases);
    app.provide(classNamePrefixKey, config.classNamePrefix);
    app.component('VBox', VBox);
    app.directive('vbox-runtime', vboxRuntimeDirective);
  },
};
