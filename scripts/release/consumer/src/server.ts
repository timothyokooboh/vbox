import { renderToString } from '@vue/server-renderer';
import { getSSRStyles } from '@veebox/vue';
import { createApp } from './app';
export async function render() {
  const context = {};
  return {
    html: await renderToString(createApp(), context),
    css: getSSRStyles(context),
  };
}
