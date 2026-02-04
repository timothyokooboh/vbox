import { createStyleCollector, type StyleCollector } from '@veebox/core';

export const VBOX_SSR_COLLECTOR_KEY = '__vboxStyles';

export type VBoxSSRContext = {
  [VBOX_SSR_COLLECTOR_KEY]?: StyleCollector;
};

export const getSSRCollector = (context: VBoxSSRContext) => {
  if (!context[VBOX_SSR_COLLECTOR_KEY]) {
    context[VBOX_SSR_COLLECTOR_KEY] = createStyleCollector();
  }

  const collector = context[VBOX_SSR_COLLECTOR_KEY]!;

  const eventContext = (context as { event?: { context?: Record<string, unknown> } })
    ?.event?.context;
  if (eventContext) {
    eventContext[VBOX_SSR_COLLECTOR_KEY] = collector;
  }

  return collector;
};

export const getSSRStyles = (context: VBoxSSRContext) => {
  return context[VBOX_SSR_COLLECTOR_KEY]?.getCss() ?? '';
};
