export interface Fraction {
  n: number;
  d: number;
}

export type FractionLike = number | number[] | Fraction;

export function equals(fraction1: Fraction, fraction2: Fraction) {
  return fraction1.n === fraction2.n && fraction1.d === fraction2.d;
}

export function parse(string: string): Fraction {
  const match = string.match(/^(?<numerator>\d+)(\/(?<denominator>\d+))?$/);
  if (!match || !match.groups) {
    throw new Error("string");
  }
  const denominator = match.groups.denominator;
  return {
    n: parseInt(match.groups.numerator, 10),
    d: denominator === undefined ? 1 : parseInt(denominator, 10),
  };
}

export function fractionToString(fraction: Fraction) {
  if (fraction.d === 1) {
    return fraction.n.toString();
  }
  return `${fraction.n}/${fraction.d}`;
}

export function asFraction(thing: FractionLike): Fraction {
  if (typeof thing === "number") {
    if (thing !== Math.floor(thing)) {
      throw new Error(
        "Non-integer used as fraction. Try writing [a, b] instead of a / b.",
      );
    }
    return { n: thing, d: 1 };
  }
  if (Array.isArray(thing)) {
    if (thing.length !== 2) {
      throw new Error("Length must be 2");
    }
    return { n: thing[0], d: thing[1] };
  }
  return thing;
}
