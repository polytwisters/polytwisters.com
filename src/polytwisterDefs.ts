import { PolytwisterSymbolLike } from "./symbol";
import { PolytwisterSymbol } from "./symbol";

/**
 * An object for inputting polytwister definitions.
 */
export interface PolytwisterDefSpec {
  name: string;
  acronym?: string;
  symbol: PolytwisterSymbolLike;
}

/**
 * A polytwister definition, which is a symbol + name + acronym.
 */
export class PolytwisterDef {
  name: string;
  acronym?: string;
  symbol: PolytwisterSymbol;

  constructor(spec: PolytwisterDefSpec) {
    this.name = spec.name;
    this.acronym = spec.acronym;
    this.symbol = PolytwisterSymbol.from(spec.symbol);
  }

  asFields(): PolytwisterFields {
    return {
      name: this.name,
      acronym: this.acronym,
      symbol: this.symbol,
      symbolString: this.symbol.toString_(),
      regular: this.symbol.isRegular(),
      convex: this.symbol.isConvex(),
      dyadic: this.symbol.isDyadic(),
      rectifiedDyadic: this.symbol.isRectifiedDyadic(),
    };
  }
}

export interface PolytwisterFields {
  name: string;
  acronym?: string;
  symbol: PolytwisterSymbol;
  symbolString: string;
  regular: boolean;
  convex: boolean;
  dyadic: boolean;
  rectifiedDyadic: boolean;
}

export class PolytwisterDatabase {
  defs: PolytwisterDef[];

  constructor(specs: PolytwisterDefSpec[]) {
    this.defs = specs.map((spec) => new PolytwisterDef(spec));
  }

  has(name: string): boolean {
    return this.findIndexByName(name) !== -1;
  }

  findByName(name: string): PolytwisterDef | undefined {
    return this.defs.find((def) => def.name === name)
  }

  findIndexByName(name: string): number {
    return this.defs.findIndex((def) => def.name === name)
  }

  indexToName(index: number): string {
    return this.defs[index].name;
  }

  getNextPolytwister(name: string): string {
    let index = this.findIndexByName(name);
    const newIndex = (index + 1) % this.defs.length;
    return this.defs[newIndex].name;
  }

  getPreviousPolytwister(name: string): string {
    let index = this.findIndexByName(name);
    const newIndex = (index - 1 + this.defs.length) % this.defs.length;
    return this.defs[newIndex].name;
  }
}


function dyadicTwister(n: number): PolytwisterDefSpec {
  const result = {
    name: `${n} dyadic twister`,
    symbol: [2, n],
  };
  return result;
}

function starDyadicTwister(n: number, d: number): PolytwisterDefSpec {
  return {
    name: `${n}/${d} dyadic twister`,
    symbol: [2, [n, d]],
  };
}

const specs: PolytwisterDefSpec[] = [
  {
    name: "tetratwister",
    acronym: "tetter",
    symbol: [3, 3],
  },
  {
    name: "quasitetratwister",
    acronym: "quitter",
    symbol: [[3, 2], 3],
  },
  {
    name: "bloated tetratwister",
    acronym: "blitter",
    symbol: [3, [3, 2]],
  },
  {
    name: "inverted tetratwister",
    acronym: "itter",
    symbol: [[3, 2], [3, 2]],
  },
  {
    name: "cube twister",
    acronym: "cubiter",
    symbol: [4, 3],
  },
  {
    name: "quasicube twister",
    acronym: "quicter",
    symbol: [[4, 3], 3],
  },
  {
    name: "bloated cube twister",
    acronym: "blicter",
    symbol: [4, [3, 2]],
  },
  {
    name: "inverted cube twister",
    acronym: "icter",
    symbol: [[4, 3], [3, 2]],
  },
  {
    name: "octatwister",
    acronym: "octer",
    symbol: [3, 4],
  },
  {
    name: "quasioctatwister",
    acronym: "quoter",
    symbol: [[3, 2], 4],
  },
  {
    name: "bloated octatwister",
    acronym: "bloter",
    symbol: [3, [4, 3]],
  },
  {
    name: "inverted octatwister",
    acronym: "ioter",
    symbol: [[3, 2], [4, 3]],
  },
  {
    name: "dodecatwister",
    acronym: "doter",
    symbol: [5, 3],
  },
  {
    name: "quasidodecatwister",
    acronym: "quadoter",
    symbol: [[5, 4], 3],
  },
  {
    name: "bloated dodecatwister",
    acronym: "bladoter",
    symbol: [5, [3, 2]],
  },
  {
    name: "inverted dodecatwister",
    acronym: "idoter",
    symbol: [[5, 4], [3, 2]],
  },
  {
    name: "icosatwister",
    acronym: "iketer",
    symbol: [3, 5],
  },
  {
    name: "quasicosatwister",
    acronym: "quiketer",
    symbol: [[3, 2], 5],
  },
  {
    name: "bloated icosatwister",
    acronym: "bliketer",
    symbol: [3, [5, 4]],
  },
  {
    name: "inverted icosatwister",
    acronym: "iyiketer",
    symbol: [[3, 2], [5, 4]],
  },
  {
    name: "great dodecatwister",
    acronym: "gaditer",
    symbol: [5, [5, 2]],
  },
  {
    name: "great quasidodecatwister",
    acronym: "gaquiditer",
    symbol: [[5, 4], [5, 2]],
  },
  {
    name: "great bloated dodecatwister",
    acronym: "gabliditer",
    symbol: [5, [5, 3]],
  },
  {
    name: "great inverted dodecatwister",
    acronym: "giaditer",
    symbol: [[5, 4], [5, 3]],
  },
  {
    name: "small stellated dodecatwister",
    acronym: "sissiditer",
    symbol: [[5, 2], 5],
  },
  {
    name: "small quasistellated dodecatwister",
    acronym: "soquissiditer",
    symbol: [[5, 3], 5],
  },
  {
    name: "small bloatostellated dodecatwister",
    acronym: "soblessiditer",
    symbol: [[5, 2], [5, 4]],
  },
  {
    name: "small invertostellated dodecatwister",
    acronym: "sansiditer",
    symbol: [[5, 3], [5, 4]],
  },
  {
    name: "great icosatwister",
    acronym: "giketer",
    symbol: [3, [5, 2]],
  },
  {
    name: "great quasicosatwister",
    acronym: "gaquiter",
    symbol: [[3, 2], [5, 2]],
  },
  {
    name: "great bloated icosatwister",
    acronym: "gabliter",
    symbol: [3, [5, 3]],
  },
  {
    name: "great inverted icosatwister",
    acronym: "giyiter",
    symbol: [[3, 2], [5, 3]],
  },
  {
    name: "great stellated dodecatwister",
    acronym: "gissiditer",
    symbol: [[5, 2], 3],
  },
  {
    name: "great quasistellated dodecatwister",
    acronym: "gaquassiditer",
    symbol: [[5, 3], 3],
  },
  {
    name: "great bloatostellated dodecatwister",
    acronym: "goblessiditer",
    symbol: [3, [5, 3]],
  },
  {
    name: "great invertostellated dodecatwister",
    acronym: "gansiditer",
    symbol: [[5, 3], [3, 2]],
  },
  dyadicTwister(3),
  dyadicTwister(4),
  dyadicTwister(5),
  starDyadicTwister(3, 2),
  starDyadicTwister(4, 3),
  starDyadicTwister(5, 2),
  starDyadicTwister(5, 3),
  starDyadicTwister(5, 4),
  {
    name: "tetratetratwister",
    symbol: [3, [3, 2], 2],
  },
  {
    name: "cuboctatwister",
    symbol: [4, 3, 2],
  },
  {
    name: "octaquasicubitwister",
    symbol: [[4, 3], 3, 2],
  },
  {
    name: "icosidodecatwister",
    symbol: [3, 5, 2],
  },
  {
    name: "sheaved tetratwister",
    symbol: [2, 3, 3],
  },
  {
    name: "invertisheaved tetratwister",
    symbol: [2, [3, 2], 3],
  },
  {
    name: "sheaved cubetwister",
    symbol: [4, 2, 3],
  },
  {
    name: "sheaved octatwister",
    symbol: [3, 2, 4],
  },
  {
    name: "sheaved dodecatwister",
    symbol: [5, 2, 3],
  },
  {
    name: "sheaved icosatwister",
    symbol: [3, 2, 5],
  },
  {
    name: "rectified 3 dyadic twister",
    symbol: [2, 3, 2],
  },
  {
    name: "rectified 4 dyadic twister",
    symbol: [2, 4, 2],
  },
  {
    name: "rectified 5 dyadic twister",
    symbol: [2, 5, 2],
  },
];

export const database = new PolytwisterDatabase(specs);