import { asFraction, type Fraction, type FractionLike } from "./fraction";

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