import { test, expect } from "vitest";
import * as fraction from "./fraction";
import * as symbol from "./symbol";

test("PolytwisterSymbol.from passthrough", () => {
  const symbol1 = symbol.PolytwisterSymbol.from([3, [3, 2], 2]);
  const symbol2 = symbol.PolytwisterSymbol.from(symbol1);
  expect(symbol1).toEqual(symbol2);
});

test("fraction.parse", () => {
  const actual = fraction.parse("3/4");
  const expected = { n: 3, d: 4 };
  expect(actual).toEqual(expected);
});

test("fraction.parse with no denominator", () => {
  const actual = fraction.parse("3");
  const expected = { n: 3, d: 1 };
  expect(actual).toEqual(expected);
});
