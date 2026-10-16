import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/vue';
import { VBoxPlugin } from '@veebox/vue';
import config from '../../../vbox.config';
import ButtonConsumer from './ButtonConsumer.vue';

describe('AppButton style sources', () => {
  it('reveals the PVA default when a grouped caller override is withdrawn', async () => {
    const { rerender } = render(ButtonConsumer, {
      props: { override: true },
      global: { plugins: [[VBoxPlugin, config]] },
    });
    const button = screen.getByRole('button', { name: 'Save draft' });
    expect(getComputedStyle(button).color).toBe('rgb(255, 255, 0)');
    await rerender({ override: false });
    expect(getComputedStyle(button).color).toBe('rgb(255, 255, 255)');
  });

  it('keeps semantic attributes, disabled state and listeners independent of styling', async () => {
    const { rerender } = render(ButtonConsumer, {
      props: { override: true },
      global: { plugins: [[VBoxPlugin, config]] },
    });
    const button = screen.getByRole('button', { name: 'Save draft' });
    expect(button.getAttribute('type')).toBe('submit');
    expect(button.getAttribute('translate')).toBe('no');
    await fireEvent.click(button);
    expect(screen.getByRole('status').textContent).toBe('Saved 1');
    await rerender({ override: true, disabled: true });
    expect((button as HTMLButtonElement).disabled).toBe(true);
    button.click();
    expect(screen.getByRole('status').textContent).toBe('Saved 1');
  });
});
