import {
  asFraction,
  type Fraction,
  type FractionLike,
  fractionToString,
} from "./fraction";
import * as fraction from "./fraction";

export type PolytwisterSymbolLike = FractionLike[] | PolytwisterSymbol;

export enum SymmetryKind {
  Dihedral,
  Tetrahedral,
  Octahedral,
  Icosahedral,
}

/**
 * A type for "symmetry symbols" which are of the form D_2n, T, I, or O.
 */
export type SymmetrySymbol =
  | { kind: SymmetryKind.Tetrahedral }
  | { kind: SymmetryKind.Octahedral }
  | { kind: SymmetryKind.Icosahedral }
  | { kind: SymmetryKind.Dihedral; n: number };

/**
 * A Wythoff-style symbol for a polytwister. The fields "ring," "twister1," and
 * "twister2" are the angles between three mirrors. The generator point is
 * placed at the "ring" mirror. If "regular" is false, a generator plane is placed
 * at both types of twisters. If it is true, it's placed at "twister1" only.
 *
 * In the regular case, twister1 is always the fraction 2/1.
 */
export class PolytwisterSymbol {
  ring: Fraction;
  twister1: Fraction;
  twister2: Fraction;
  regular: boolean;

  constructor(
    ring: Fraction,
    twister1: Fraction,
    twister2: Fraction,
    regular: boolean,
  ) {
    this.ring = ring;
    this.twister1 = twister1;
    this.twister2 = twister2;
    this.regular = regular;
  }

  toString_(): string {
    const a = fractionToString(this.twister1);
    const b = fractionToString(this.twister2);
    const c = fractionToString(this.ring);
    if (this.regular) {
      return `{${b}, ${c}}`;
    }
    return `(${a}, ${b}) ${c}`;
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
        fraction.equals(this.twister1, other.twister1) &&
        fraction.equals(this.twister2, other.twister2)
      );
    }
    return (
      (fraction.equals(this.twister1, other.twister1) &&
        fraction.equals(this.twister2, other.twister2)) ||
      (fraction.equals(this.twister1, other.twister2) &&
        fraction.equals(this.twister2, other.twister1))
    );
  }

  isRegular(): boolean {
    return this.regular;
  }

  isConvex(): boolean {
    return this.ring.d === 1 && this.twister1.d === 1 && this.twister2.d === 1;
  }

  /**
   * Return true if this belongs to the family of th dyadic twisters.
   */
  isDyadic(): boolean {
    return this.regular && this.twister1.n === 2;
  }

  /**
   * Return true if this belongs to the family of the rectified dyadic twisters.
   */
  isRectifiedDyadic(): boolean {
    return (
      !this.regular &&
      this.ring.n === 2 &&
      this.ring.d === 1 &&
      (this.twister1.n === 2 || this.twister2.n === 2)
    );
  }

  isBloatedRectifiedDyadic(): boolean {
    return (
      !this.regular &&
      this.ring.n === 2 &&
      this.ring.d === 3 &&
      (this.twister1.n === 2 || this.twister2.n === 2)
    );
  }

  isInInfiniteFamily(): boolean {
    return (
      this.isDyadic() ||
      this.isRectifiedDyadic() ||
      this.isBloatedRectifiedDyadic()
    );
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
        true,
      );
    }
    const matchNonregular = tmp.match(
      /^\((\d+(\/\d+)?),(\d+(\/\d+)?)\)(\d+(\/\d+)?)$/,
    );
    if (!matchNonregular) {
      throw new Error("Can't parse symbol");
    }
    return new PolytwisterSymbol(
      fraction.parse(matchNonregular[5]),
      fraction.parse(matchNonregular[1]),
      fraction.parse(matchNonregular[3]),
      false,
    );
  }

  static from(thing: PolytwisterSymbolLike) {
    if (thing instanceof PolytwisterSymbol) {
      return new PolytwisterSymbol(
        thing.ring,
        thing.twister1,
        thing.twister2,
        thing.regular,
      );
    }
    if (thing.length === 2) {
      return new PolytwisterSymbol(
        asFraction(thing[1]),
        asFraction(2),
        asFraction(thing[0]),
        true,
      );
    }
    if (thing.length === 3) {
      return new PolytwisterSymbol(
        asFraction(thing[2]),
        asFraction(thing[0]),
        asFraction(thing[1]),
        false,
      );
    }
    throw new Error("Invalid polytwister symbol");
  }

  serializeURI(): string {
    const a = fractionToString(this.twister1);
    const b = fractionToString(this.twister2);
    const c = fractionToString(this.ring);
    if (this.regular) {
      return `${b}.${c}`;
    }
    return `${a}.${b}.${c}`;
  }

  static deserializeURI(string: string): PolytwisterSymbol {
    const parts = string.split(/\./g);
    if (parts.length === 2) {
      return new PolytwisterSymbol(
        fraction.parse(parts[1]),
        asFraction(2),
        fraction.parse(parts[0]),
        true,
      );
    }
    if (parts.length !== 3) {
      throw new Error("Invalid symbol");
    }
    return new PolytwisterSymbol(
      fraction.parse(parts[2]),
      fraction.parse(parts[0]),
      fraction.parse(parts[1]),
      false,
    );
  }

  symmetrySymbol(): SymmetrySymbol {
    /* Coxeter, "Uniform Polyhedra," p. 409:
    "A given Schwarz triangle (p q r) can be recognized as dihedral if two of p, q, r are equal to
    2, and otherwise tetrahedral (g = 24), octahedral (g = 48), or icosahedral (g = 120), according
    as the largest numerator occuring is 3, 4, or 5."
    */

    // Find the numerators and sort them from smallest to largest.
    const numerators = [this.twister1.n, this.twister2.n, this.ring.n].sort();

    // Dihedral case: [2, 2, n].
    if (numerators[0] === 2 && numerators[1] === 2) {
      return { kind: SymmetryKind.Dihedral, n: numerators[2] };
    }
    const maxNumerator = Math.max(...numerators);
    if (maxNumerator === 3) {
      return { kind: SymmetryKind.Tetrahedral };
    }
    if (maxNumerator === 4) {
      return { kind: SymmetryKind.Octahedral };
    }
    if (maxNumerator === 5) {
      return { kind: SymmetryKind.Icosahedral };
    }
    throw new Error("Invalid Schwarz triangle, cannot find symbol");
  }
}
