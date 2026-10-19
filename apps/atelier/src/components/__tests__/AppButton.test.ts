import { expect, it } from 'vitest';
import { render, screen } from '@testing-library/vue';
import { VBoxPlugin } from '@veebox/vue';
import config from '../../../vbox.config';
import ButtonConsumer from './ButtonConsumer.vue';
it('keeps semantic props and native disabled interaction separate from caller styling', async () => {
  const { rerender } = render(ButtonConsumer, {
    props: { disabled: false },
    global: { plugins: [[VBoxPlugin, config]] },
  });
  const button = screen.getByRole('button', { name: 'Save selection' });
  expect(button.getAttribute('type')).toBe('submit');
  expect(button.getAttribute('translate')).toBe('no');
  expect(getComputedStyle(button).color).toBe('rgb(128, 0, 128)');
  button.click();
  await rerender({ disabled: true });
  expect(screen.getByRole('status').textContent).toBe('Saved 1');
  button.click();
  expect(screen.getByRole('status').textContent).toBe('Saved 1');
});
