import { render } from '@testing-library/vue';
import { describe, expect, it } from 'vitest';
import BaseButton from './BaseButton.vue';

describe('BaseButton', () => {
  it('renders with solid variant defaults', () => {
    const { getByRole } = render(BaseButton, {
      slots: { default: 'Launch' },
    });

    expect(getByRole('button', { name: 'Launch' })).toBeTruthy();
  });

  it('renders anchor semantics when as=a', () => {
    const { getByRole } = render(BaseButton, {
      props: { as: 'a', href: 'https://example.com', variant: 'outline' },
      slots: { default: 'Docs' },
    });

    expect(getByRole('link', { name: 'Docs' })).toBeTruthy();
  });
});
