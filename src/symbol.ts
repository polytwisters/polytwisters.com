import {
  asFraction,
  type Fraction,
  type FractionLike,
  fractionToString,
} from "./fraction";
import * as fraction from "./fraction";

export type PolytwisterSymbolLike = FractionLike[] | PolytwisterSymbol;

/**
 * A Wythoff-style symbol for a polytwister. The fields "ring," "twister1," and
 * "twister2" are the angles between three mirrors. The generator point is
 * placed at the "ring" mirror. If "quasiregular" is false, a generator plane
 * is placed at "twister1" only. If it is true, a generator plane is placed at
 * both types of twisters.
 * 
 * In the regular case, twister1 is always the fraction 2/1.
 */
export class PolytwisterSymbol {
  ring: Fraction;
  twister1: Fraction;
  twister2: Fraction;
  quasiregular: boolean;

  constructor(
    ring: Fraction,
    twister1: Fraction,
    twister2: Fraction,
    quasiregular: boolean,
  ) {
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

  equals(other: PolytwisterSymbol): boolean {
    if (!(this.isRegular() === other.isRegular())) {
      return false;
    }
    if (!fraction.equals(this.ring, other.ring)) {
      return false;
    }
    if (this.isRegular()) {
      return (
        fraction.equals(this.twister1, other.twister1)
        && fraction.equals(this.twister2, other.twister2)
      );
    }
    return (
      fraction.equals(this.twister1, other.twister1)
      && fraction.equals(this.twister2, other.twister2)
    ) || (
      fraction.equals(this.twister1, other.twister2)
      && fraction.equals(this.twister2, other.twister1)
    );
  }

  isBloated(): boolean {
    return this.ring.d > this.ring.n / 2;
  }

  isRegular(): boolean {
    return !this.quasiregular;
  }

  isConvex(): boolean {
    return this.ring.d === 1 && this.twister1.d === 1 && this.twister2.d === 1;
  }

  /**
   * Return true if this belongs to the family of th dyadic twisters.
   */
  isDyadic(): boolean {
    return !this.quasiregular && this.twister1.n === 2;
  }

  /**
   * Return true if this belongs to the family of the rectified dyadic twisters.
   */
  isRectifiedDyadic(): boolean {
    return (
      this.quasiregular &&
      (this.ring.n === 2 && this.ring.d === 1) &&
      (this.twister1.n === 2 || this.twister2.n === 2)
    );
  }

  isBloatedRectifiedDyadic(): boolean {
    return (
      this.quasiregular &&
      (this.ring.n === 2 && this.ring.d === 3) &&
      (this.twister1.n === 2 || this.twister2.n === 2)
    );
  }

  isInInfiniteFamily(): boolean {
    return this.isDyadic() || this.isRectifiedDyadic() || this.isBloatedRectifiedDyadic();
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
        false,
      );
    }
    const matchQuasiregular = tmp.match(
      /^\((\d+(\/\d+)?),(\d+(\/\d+)?)\)(\d+(\/\d+)?)$/,
    );
    if (!matchQuasiregular) {
      throw new Error("Can't parse symbol");
    }
    return new PolytwisterSymbol(
      fraction.parse(matchQuasiregular[5]),
      fraction.parse(matchQuasiregular[1]),
      fraction.parse(matchQuasiregular[3]),
      true,
    );
  }

  static from(thing: PolytwisterSymbolLike) {
    if (thing instanceof PolytwisterSymbol) {
      return new PolytwisterSymbol(
        thing.ring,
        thing.twister1,
        thing.twister2,
        thing.quasiregular,
      );
    }
    if (thing.length === 2) {
      return new PolytwisterSymbol(
        asFraction(thing[1]),
        asFraction(2),
        asFraction(thing[0]),
        false,
      );
    }
    if (thing.length === 3) {
      return new PolytwisterSymbol(
        asFraction(thing[2]),
        asFraction(thing[0]),
        asFraction(thing[1]),
        true,
      );
    }
    throw new Error("Invalid polytwister symbol");
  }

  serializeURI(): string {
    const a = fractionToString(this.twister1);
    const b = fractionToString(this.twister2);
    const c = fractionToString(this.ring);
    if (this.quasiregular) {
      return `${a}.${b}.${c}`;
    }
    return `${b}.${c}`;
  }

  static deserializeURI(string: string): PolytwisterSymbol {
    const parts = string.split(/\./g);
    if (parts.length === 2) {
      return new PolytwisterSymbol(
        fraction.parse(parts[1]),
        asFraction(2),
        fraction.parse(parts[0]),
        false
      );
    }
    if (parts.length !== 3) {
      throw new Error("Invalid symbol");
    }
    return new PolytwisterSymbol(
      fraction.parse(parts[2]),
      fraction.parse(parts[0]),
      fraction.parse(parts[1]),
      true
    );
  }
}
