import { VBOX_SSR_COLLECTOR_KEY } from '@veebox/vue';

export const getVboxSsrCss = (context) => {
  const collector = context?.[VBOX_SSR_COLLECTOR_KEY];
  if (!collector || typeof collector.getCss !== 'function') return '';
  return collector.getCss() ?? '';
};
