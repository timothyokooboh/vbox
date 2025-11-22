import type { StandardPropertiesHyphenFallback } from "csstype";
import { SpacingProperties, TokensMap } from "../constants";

const deriveToken = (tokenIdentifier: string, value: string) => {
  return `--${tokenIdentifier}-${value}`;
};

const hasToken = (token: string) => {
  const computedValue = getComputedStyle(document.documentElement)
    .getPropertyValue(token)
    .trim();

  return !!computedValue;
};

export const useDesignTokens = <
  T extends keyof StandardPropertiesHyphenFallback,
>(
  cssProp: T,
  value: string,
  styles: Record<string, string>,
) => {
  const newStyles = { ...styles };
  const trimmedValue = value.trim();

  switch (true) {
    case cssProp === "color" &&
      hasToken(deriveToken(TokensMap.color, trimmedValue)):
      return {
        ...newStyles,
        color: `var(${deriveToken(TokensMap.color, trimmedValue)})`,
      };
    case cssProp === "font-size" &&
      hasToken(deriveToken(TokensMap["font-size"], trimmedValue)):
      return {
        ...newStyles,
        "font-size": `var(${deriveToken(TokensMap["font-size"], trimmedValue)})`,
      };
    case cssProp === "font-weight" &&
      hasToken(deriveToken(TokensMap.color, trimmedValue)):
      return {
        ...newStyles,
        "font-weight": `var(${deriveToken(TokensMap["font-weight"], trimmedValue)})`,
      };
    case cssProp === "font-family":
      return {
        ...newStyles,
        "font-family": `var(${deriveToken(TokensMap["font-family"], trimmedValue)})`,
      };
    case SpacingProperties.includes(
      cssProp as (typeof SpacingProperties)[number],
    ) && hasToken(deriveToken(TokensMap["spacing"], trimmedValue)):
      return {
        ...newStyles,
        [cssProp]: `var(${deriveToken(TokensMap["spacing"], trimmedValue)})`,
      };
    default:
      return newStyles;
  }
};
