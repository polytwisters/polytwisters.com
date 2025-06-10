import { asFraction, type Fraction, type FractionLike, fractionToString } from "./fraction";
import * as fraction from "./fraction";

export type PolytwisterSymbolLike = FractionLike[] | PolytwisterSymbol;

/**
 * A Wythoff-style symbol for a polytwister. The fields "ring," "twister1," and
 * "twister2" are the angles between three mirrors. The generator point is
 * placed at the "ring" mirror. If "quasiregular" is false, a generator plane
 * is placed at "twister1" only. If it is true, a generator plane is placed at
 * both types of twisters.
 */
export class PolytwisterSymbol {
  ring: Fraction;
  twister1: Fraction;
  twister2: Fraction;
  quasiregular: boolean;
  
  constructor(ring: Fraction, twister1: Fraction, twister2: Fraction, quasiregular: boolean) {
    this.ring = ring;
    this.twister1 = twister1;
    this.twister2 = twister2;
    this.quasiregular = quasiregular;
  }

  toString_(): string {
    const a = fractionToString(this.twister1);
    const b = fractionToString(this.twister2);
    const c = fractionToString(this.ring);
    if (this.quasiregular) {
      return `(${a}, ${b}) ${c}`;
    }
    return `{${b}, ${c}}`;
  }

  isBloated(): boolean {
    return this.ring.d > this.ring.n / 2;
  }

  static parse(string: string): PolytwisterSymbol {
    // Remove whitespace.
    const tmp = string.replace(/\s+/g, "");
    const matchSchlafli = tmp.match(/^\{(\d+(\/\d+)?),(\d+(\/\d+)?)\}$/);
    if (matchSchlafli) {
      return new PolytwisterSymbol(
        fraction.parse(matchSchlafli[3]),
        asFraction(2),
        fraction.parse(matchSchlafli[1]),
        false
      );
    }
    const matchQuasiregular = tmp.match(/^\((\d+(\/\d+)?),(\d+(\/\d+)?)\)(\d+(\/\d+)?)$/);
    if (!matchQuasiregular) {
      throw new Error("Can't parse symbol");
    }
    return new PolytwisterSymbol(
      fraction.parse(matchQuasiregular[5]),
      fraction.parse(matchQuasiregular[1]),
      fraction.parse(matchQuasiregular[3]),
      true
    );
  }

  static from(thing: PolytwisterSymbolLike) {
    if (thing instanceof PolytwisterSymbol) {
      return new PolytwisterSymbol(
        thing.ring,
        thing.twister1,
        thing.twister2,
        thing.quasiregular
      );
    }
    if (thing.length === 2) {
      return new PolytwisterSymbol(
        asFraction(thing[1]),
        asFraction(2),
        asFraction(thing[0]),
        false
      );
    }
    if (thing.length === 3) {
      return new PolytwisterSymbol(
        asFraction(thing[2]),
        asFraction(thing[0]),
        asFraction(thing[1]),
        true
      );
    }
    throw new Error("Invalid polytwister symbol");
  }
}