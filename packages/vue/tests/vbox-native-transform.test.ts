import { expect, test } from 'vitest';
import { render } from '@testing-library/vue';
import VBoxPlugin from '../src/plugins';
import NativeConsumer from './fixtures/NativeConsumer.vue';

test('compiled native bindings preserve semantic attributes alongside the published component', async () => {
  const view = render(NativeConsumer, {
    props: { styles: { color: 'red', translate: '1px' } },
    global: { plugins: [VBoxPlugin] },
  });
  try {
    const button = view.getByRole('button', { name: 'Native styling' });
    expect(button.getAttribute('translate')).toBe('no');
    expect(button.getAttribute('type')).toBe('button');
    expect(getComputedStyle(button).color).toBe('rgb(255, 0, 0)');
    expect(getComputedStyle(button).translate).toBe('1px');
    const paragraphs = view.container.querySelectorAll('p');
    expect(getComputedStyle(paragraphs[0]).color).toBe('rgb(128, 0, 128)');
    expect(paragraphs[1].getAttribute('color')).toBe('red');
    expect(getComputedStyle(paragraphs[1]).color).not.toBe('rgb(255, 0, 0)');
    await view.rerender({ styles: { color: 'blue' } });
    expect(getComputedStyle(button).color).toBe('rgb(0, 0, 255)');
    expect(button.getAttribute('translate')).toBe('no');
    expect(getComputedStyle(button).translate).not.toBe('1px');
  } finally {
    view.unmount();
  }
});
