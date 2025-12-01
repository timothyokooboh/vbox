import type { Breakpoints } from "./types";

export const DefaultAliases = {
  w: "width",
  maxW: "maxWidth",
  minW: "minWidth",
  h: "height",
  maxH: "maxHeight",
  minH: "minHeight",
  fs: "fontSize",
  fw: "fontWeight",
  ff: "fontFamily",
  lh: "lineHeight",
  ls: "letterSpacing",
  m: "margin",
  mt: "marginBlockStart",
  mb: "marginBlockEnd",
  ml: "marginInlineStart",
  mr: "marginInlineEnd",
  mx: "marginInline",
  my: "marginBlock",
  p: "padding",
  pt: "paddingBlockStart",
  pb: "paddingBlockEnd",
  pl: "paddingInlineStart",
  pr: "paddingInlineEnd",
  px: "paddingInline",
  py: "paddingBlock",
  bg: "background",
  bgColor: "backgroundColor",
  bgSize: "backgroundSize",
  bgPosition: "backgroundPosition",
  bgImage: "backgroundImage",
  bgClip: "backgroundClip",
  bgRepeat: "backgroundRepeat",
  bgAttachment: "backgroundAttachment",
  bgOrigin: "backgroundOrigin",
  radius: "borderRadius",
  shadow: "boxShadow",
  d: "display",
} as const;

export const TokensMap = {
  color: "colors",
  "font-size": "font-size",
  "font-weight": "font-weight",
  "font-family": "font-family",
  spacing: "spacing",
};

export const ColorProperties = [
  "color",
  "background",
  "background-color",
  "border-color",
  "outline-color",
  "caret-color",
  "text-decoration-color",
  "fill",
  "stroke",
] as const;

export const SpacingProperties = [
  "margin",
  "margin-top",
  "margin-block-start",
  "margin-bottom",
  "margin-block-end",
  "margin-block",
  "margin-right",
  "margin-inline-end",
  "margin-left",
  "margin-inline-start",
  "margin-inline",
  "padding",
  "padding-top",
  "padding-block-start",
  "padding-bottom",
  "padding-block-end",
  "padding-block",
  "padding-right",
  "padding-inline-end",
  "padding-left",
  "padding-inline-start",
  "padding-inline",
  "gap",
  "column-gap",
  "row-gap",
  "line-height",
  "letter-spacing",
  "border-spacing",
  "word-spacing",
  "text-indent",
] as const;

export const DefaultBreakpoints: Breakpoints = {
  sm: "40rem", // ~640px
  md: "48rem", // ~768px
  lg: "64rem", // ~1024px
  xl: "80rem", // ~1280px
  //"2xl": "96rem", // ~1536px
};
