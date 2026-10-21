import { pva } from '../src/index.js';
const styles = pva({
  variants: { density: { '': { padding: '4px' } } },
  defaultVariants: { density: '' },
});
styles({ density: '' });
// @ts-expect-error Only the declared empty-string selection is valid.
styles({ density: 'unknown' });
