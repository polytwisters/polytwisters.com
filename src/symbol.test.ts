import { test, expect } from "vitest";
import { PolytwisterSymbol } from "./symbol";

test("serializing a regular PolytwisterSymbol works", () => {
  const symbol = PolytwisterSymbol.from([[3, 2], 4]);
  expect(symbol.serializeURI()).toBe("3/2.4");
  expect(PolytwisterSymbol.deserializeURI(symbol.serializeURI())).toStrictEqual(
    symbol,
  );
});

test("serializing a non-regular PolytwisterSymbol works", () => {
  const symbol = PolytwisterSymbol.from([[3, 2], 4, [5, 2]]);
  expect(symbol.serializeURI()).toBe("3/2.4.5/2");
  expect(PolytwisterSymbol.deserializeURI(symbol.serializeURI())).toStrictEqual(
    symbol,
  );
});
