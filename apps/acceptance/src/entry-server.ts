import { renderToString } from '@vue/server-renderer';
import { getSSRStyles, getSSRCollector } from '@veebox/vue';
import { buildCSSVariables, normalizeTheme } from '@veebox/core';
import config from '../vbox.config';
import { createFixture } from './app';

export async function render() {
  const context = {};
  // The server supplies critical theme CSS as well as component declarations.
  getSSRCollector(context).collect(
    buildCSSVariables(normalizeTheme(config.theme ?? {})),
  );
  const html = await renderToString(createFixture(true), context);
  return { html, css: getSSRStyles(context) };
}
