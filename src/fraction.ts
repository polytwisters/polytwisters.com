export interface Fraction {
  n: number,
  d: number
}

export type FractionLike = number | number[] | Fraction;

export function asFraction(thing: FractionLike): Fraction {
  if (typeof thing === "number") {
    if (thing !== Math.floor(thing)) {
      throw new Error("Non-integer used as fraction. Try writing [a, b] instead of a / b.");
    }
    return { n: thing, d: 1 }
  }
  if (Array.isArray(thing)) {
    if (thing.length !== 2) {
      throw new Error("Length must be 2");
    }
    return { n: thing[0], d: thing[1] };
  }
  return thing;
}