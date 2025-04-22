import { asFraction, type Fraction, type FractionLike } from "./fraction";

// Typechecking fails with the tuple [FractionLike, FractionLike] unfortunately.
export type PolytwisterSymbolLike = FractionLike[] | SchlafliSymbol;

export class SchlafliSymbol {
  twister: Fraction;
  ringFigure: Fraction;
  
  constructor(twister: FractionLike, ringFigure: FractionLike) {
    this.twister = asFraction(twister);
    this.ringFigure = asFraction(ringFigure);
  }

  static from(thing: PolytwisterSymbolLike) {
    if (thing instanceof SchlafliSymbol) {
      return new SchlafliSymbol(thing.twister, thing.ringFigure);
    }
    if (thing.length !== 2) {
      throw new Error("Must have length 2");
    }
    return new SchlafliSymbol(thing[0], thing[1]);
  }
}