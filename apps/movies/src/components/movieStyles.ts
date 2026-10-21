import type { VBoxStyles } from '@veebox/core';

// Loading and loaded cards reserve the same columns and metadata area.
export const movieGridStyles = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  sm: { gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' },
  lg: { gridTemplateColumns: 'repeat(5, minmax(0, 1fr))' },
  gap: 'sp-4',
} satisfies VBoxStyles;

export const movieMetadataStyles = {
  p: 'sp-3',
  display: 'grid',
  alignContent: 'start',
  gap: 'sp-1',
  minHeight: '6rem',
} satisfies VBoxStyles;
