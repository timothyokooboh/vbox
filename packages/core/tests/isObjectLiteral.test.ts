import { expect, test } from "vitest";
import { isObjectLiteral } from "../src/helpers/isObjectLiteral";

test("is object literal", () => {
  expect(isObjectLiteral({ color: "var(--color-red-100)" })).toBe(true);
  expect(isObjectLiteral({ fontSize: "1rem" })).toBe(true);
  expect(isObjectLiteral({ border: "1px solid red", margin: "20px" })).toBe(
    true,
  );
});

test("is not object literal", () => {
  expect(isObjectLiteral("color: red")).not.toBe(true);
  expect(isObjectLiteral("font-size: 1rem; color: blue")).not.toBe(true);
});
