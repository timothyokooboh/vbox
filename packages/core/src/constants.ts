import type { Breakpoints } from './types';

export const DefaultAliases = {
  w: 'width',
  maxW: 'maxWidth',
  minW: 'minWidth',
  h: 'height',
  maxH: 'maxHeight',
  minH: 'minHeight',
  fs: 'fontSize',
  fw: 'fontWeight',
  ff: 'fontFamily',
  lh: 'lineHeight',
  ls: 'letterSpacing',
  m: 'margin',
  mt: 'marginBlockStart',
  mb: 'marginBlockEnd',
  ml: 'marginInlineStart',
  mr: 'marginInlineEnd',
  mx: 'marginInline',
  my: 'marginBlock',
  p: 'padding',
  pt: 'paddingBlockStart',
  pb: 'paddingBlockEnd',
  pl: 'paddingInlineStart',
  pr: 'paddingInlineEnd',
  px: 'paddingInline',
  py: 'paddingBlock',
  bg: 'background',
  bgColor: 'backgroundColor',
  bgSize: 'backgroundSize',
  bgPosition: 'backgroundPosition',
  bgImage: 'backgroundImage',
  bgClip: 'backgroundClip',
  bgRepeat: 'backgroundRepeat',
  bgAttachment: 'backgroundAttachment',
  bgOrigin: 'backgroundOrigin',
  radius: 'borderRadius',
  shadow: 'boxShadow',
  d: 'display',
} as const;

export const DefaultBreakpoints: Breakpoints = {
  sm: '40rem', // ~640px
  md: '48rem', // ~768px
  lg: '64rem', // ~1024px
  xl: '80rem', // ~1280px
  //"2xl": "96rem", // ~1536px
};
