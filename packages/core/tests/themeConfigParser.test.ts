import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import {
  buildCSSVariables,
  normalizeTheme,
  resolveToken,
} from "../src/helpers/themeConfigParser";

describe("theme config parser", () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  describe("resolveToken", () => {
    test("resolves a simple non-color token reference", () => {
      const theme = {
        fontSize: { xl: "2rem" },
        fontWeight: { thin: "300" },
        fontFamily: { sora: "sora" },
        lineHeight: { base: "40px" },
        letterSpacing: { base: "25px" },
        zIndex: { modal: "999" },
        borderRadius: { md: "7px" },
      };

      expect(resolveToken(theme, "$fontSize.xl")).toBe("2rem");
      expect(resolveToken(theme, "$fontWeight.thin")).toBe("300");
      expect(resolveToken(theme, "$fontFamily.sora")).toBe("sora");
      expect(resolveToken(theme, "$lineHeight.base")).toBe("40px");
      expect(resolveToken(theme, "$letterSpacing.base")).toBe("25px");
      expect(resolveToken(theme, "$zIndex.modal")).toBe("999");
      expect(resolveToken(theme, "$borderRadius.md")).toBe("7px");
    });

    test("resolves chained non-color references", () => {
      const theme = {
        fontSize: { xl: "2rem", heading: "$fontSize.xl" },
      };

      const output = resolveToken(theme as any, "$fontSize.heading");
      expect(output).toBe("2rem");
    });

    test("returns the reference and warns when unknown", () => {
      const theme = {
        fontSize: { xl: "2rem" },
      };

      const ref = "$fontSize.lg";
      const output = resolveToken(theme as any, ref);
      expect(output).toBe(ref);
      expect(warnSpy).toHaveBeenCalledWith(
        `[VBox] Unknown token reference: ${ref}`,
      );
    });

    test("detects circular references and warns", () => {
      const theme = {
        fontSize: { a: "$fontSize.b", b: "$fontSize.a" },
      };

      const ref = "$fontSize.a";
      const output = resolveToken(theme as any, ref);
      expect(output).toBe(ref);
      expect(warnSpy).toHaveBeenCalled();
      // expects message to contain "Circular token reference detected"
      expect(
        warnSpy.mock.calls.some((c: any[]) =>
          String(c[0]).includes("Circular token reference detected"),
        ),
      ).toBe(true);
    });
  });

  describe("normalizeTheme", () => {
    test("normalizes primitive color tokens", () => {
      const theme = {
        color: { "red-100": "#111111" },
      };

      const { normalized, colorDarkMap } = normalizeTheme(theme);
      expect(normalized.color!["red-100"]).toBe("#111111");
      expect(colorDarkMap).toEqual({});
    });

    test("normalizes color token that references another color", () => {
      const theme = {
        color: {
          "red-300": { default: "#aaa" },
          danger: "$color.red-300",
        },
      };

      const { normalized, colorDarkMap } = normalizeTheme(theme as any);

      expect(normalized.color!["danger"]).toBe("var(--color-red-300)");
      // referenced var handles mode, so no dark map for danger
      expect(colorDarkMap).toEqual({});
    });

    test("normalizes mode-aware color tokens and populates colorDarkMap", () => {
      const theme = {
        color: {
          "red-200": { default: "#dc2f02", dark: "#efefef" },
        },
      };

      const { normalized, colorDarkMap } = normalizeTheme(theme);

      expect(normalized.color!["red-200"]).toBe("#dc2f02");
      expect(colorDarkMap["red-200"]).toBe("#efefef");
    });

    test("resolves non-color references for other categories", () => {
      const theme = {
        fontSize: { xl: "2rem", heading: "$fontSize.xl" },
        spacing: { "5": "20px", xl: "$spacing.5" },
      };

      const { normalized } = normalizeTheme(theme);
      expect(normalized.fontSize!["heading"]).toBe("2rem");
      expect(normalized.spacing!["xl"]).toBe("20px");
    });

    test("warns about unsupported color shapes", () => {
      const theme = {
        color: {
          weird: 123,
        },
      };

      const { normalized } = normalizeTheme(theme as any);
      // color.weird should not be present (because unsupported)
      expect(normalized.color!["weird"]).toBeUndefined();
      expect(warnSpy).toHaveBeenCalled();
    });
  });

  describe("buildCssVariables", () => {
    test("builds :root and html.dark when dark map exists", () => {
      const normalized = {
        color: { "red-200": "#111", danger: "var(--color-red-200)" },
        fontSize: { xl: "2rem" },
      };
      const colorDarkMap = { "red-200": "#222" };

      const css = buildCSSVariables({
        normalized: normalized as any,
        colorDarkMap,
      });

      expect(css).toContain(":root{");
      // root vars present
      expect(css).toContain("--color-red-200: #111;");
      expect(css).toContain("--color-danger: var(--color-red-200);");
      expect(css).toContain("--font-size-xl: 2rem;");
      // dark block present
      expect(css).toContain("html.dark{");
      expect(css).toContain("--color-red-200: #222;");
    });

    test("omits html.dark block when no dark entries", () => {
      const normalized = {
        color: { "red-100": "#111" },
      };
      const colorDarkMap: Record<string, string> = {};

      const css = buildCSSVariables({
        normalized: normalized as any,
        colorDarkMap,
      });

      expect(css).toContain(":root{");
      expect(css).toContain("--color-red-100: #111;");
      expect(css).not.toContain("html.dark{");
    });
  });
});
