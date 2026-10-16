import { renderToString } from '@vue/server-renderer';
import { getSSRStyles } from '@veebox/vue';
import { createFixture, type FixtureName } from './app';

export async function render(fixture: FixtureName = 'standard') {
  const context = {};
  const html = await renderToString(createFixture(true, fixture), context);
  return { html, css: getSSRStyles(context) };
}
