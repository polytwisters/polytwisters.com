import { PolytwisterSymbolLike } from "./symbol";
import { PolytwisterSymbol } from "./symbol";

/**
 * An object for inputting polytwister definitions.
 */
export interface PolytwisterDefSpec {
  name: string;
  acronym?: string;
  symbol: PolytwisterSymbolLike;
  bug?: string;
}

/**
 * A polytwister definition, which is a symbol + name + acronym.
 */
export class PolytwisterDef {
  name: string;
  acronym?: string;
  bug?: string;
  symbol: PolytwisterSymbol;

  constructor(spec: PolytwisterDefSpec) {
    this.name = spec.name;
    this.acronym = spec.acronym;
    this.symbol = PolytwisterSymbol.from(spec.symbol);
    this.bug = spec.bug;
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
      bug: this.bug,
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
  bug?: string;
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
    return this.defs.find((def) => def.name === name);
  }

  findIndexByName(name: string): number {
    return this.defs.findIndex((def) => def.name === name);
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
    symbol: [
      [3, 2],
      [3, 2],
    ],
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
    symbol: [
      [4, 3],
      [3, 2],
    ],
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
    symbol: [
      [3, 2],
      [4, 3],
    ],
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
    symbol: [
      [5, 4],
      [3, 2],
    ],
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
    symbol: [
      [3, 2],
      [5, 4],
    ],
  },
  {
    name: "great dodecatwister",
    acronym: "gaditer",
    symbol: [5, [5, 2]],
  },
  {
    name: "great quasidodecatwister",
    acronym: "gaquiditer",
    symbol: [
      [5, 4],
      [5, 2],
    ],
  },
  {
    name: "great bloated dodecatwister",
    acronym: "gabliditer",
    symbol: [5, [5, 3]],
  },
  {
    name: "great inverted dodecatwister",
    acronym: "giaditer",
    symbol: [
      [5, 4],
      [5, 3],
    ],
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
    symbol: [
      [5, 2],
      [5, 4],
    ],
  },
  {
    name: "small invertostellated dodecatwister",
    acronym: "sansiditer",
    symbol: [
      [5, 3],
      [5, 4],
    ],
  },
  {
    name: "great icosatwister",
    acronym: "giketer",
    symbol: [3, [5, 2]],
  },
  {
    name: "great quasicosatwister",
    acronym: "gaquiter",
    symbol: [
      [3, 2],
      [5, 2],
    ],
  },
  {
    name: "great bloated icosatwister",
    acronym: "gabliter",
    symbol: [3, [5, 3]],
  },
  {
    name: "great inverted icosatwister",
    acronym: "giyiter",
    symbol: [
      [3, 2],
      [5, 3],
    ],
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
    symbol: [[5, 2], [3, 2]],
  },
  {
    name: "great invertostellated dodecatwister",
    acronym: "gansiditer",
    symbol: [
      [5, 3],
      [3, 2],
    ],
  },
  dyadicTwister(3),
  dyadicTwister(4),
  dyadicTwister(5),
  starDyadicTwister(3, 2),
  starDyadicTwister(4, 3),
  starDyadicTwister(5, 2),
  starDyadicTwister(5, 3),
  starDyadicTwister(5, 4),

  //////////////////////////////////////////////////////////////////////////////
  // Quasiregulars

  // Tetratratwister variants
  {
    name: "tetratetratwister",
    acronym: "tatetter",
    symbol: [3, [3, 2], 2],
  },
  {
    name: "bloated tetratetratwister",
    acronym: "blatatetter",
    symbol: [3, [3, 2], [2, 3]],
  },

  // Cuboctatwister variants
  {
    name: "cuboctatwister",
    acronym: "coter",
    symbol: [4, 3, 2],
  },
  {
    name: "octaquasicubitwister",
    acronym: "oquicter",
    symbol: [[4, 3], 3, 2],
  },
  {
    name: "cubiquasioctatwister",
    acronym: "caquoter",
    symbol: [4, [3, 2], 2],
  },
  {
    name: "quasicuboctatwister",
    acronym: "quicoter",
    symbol: [[4, 3], [3, 2], 2],
  },
  {
    name: "bloated cuboctatwister",
    acronym: "blicoter",
    symbol: [4, 3, [2, 3]],
  },
  {
    name: "octabloated cube twister",
    acronym: "oblicter",
    symbol: [[4, 3], 3, [2, 3]],
  },
  {
    name: "cubibloated octatwister",
    acronym: "cabloter",
    symbol: [4, [3, 2], [2, 3]],
  },
  {
    name: "inverticuboctatwister",
    acronym: "icoter",
    symbol: [
      [4, 3],
      [3, 2],
      [2, 3],
    ],
  },

  // Icosidodecahedron variants
  {
    name: "icosidodecatwister",
    acronym: "iditer",
    symbol: [5, 3, 2],
  },
  {
    name: "icosiquasidodecatwister",
    acronym: "iquiditer",
    symbol: [[5, 4], 3, 2],
  },
  {
    name: "dodecaquasiicosatwister",
    acronym: "daquiter",
    symbol: [5, [3, 2], 2],
  },
  {
    name: "quasiicosidodecatwister",
    acronym: "quiditer",
    symbol: [[5, 4], [3, 2], 2],
  },
  {
    name: "bloated icosidodecatwister",
    acronym: "bliditer",
    symbol: [5, 3, [2, 3]],
  },
  {
    name: "icosibloated dodecatwister",
    acronym: "ibliditer",
    symbol: [[5, 4], 3, [2, 3]],
  },
  {
    name: "dodecabloated icosatwister",
    acronym: "dabliter",
    symbol: [5, [3, 2], [2, 3]],
  },
  {
    name: "inverticosidodecatwister",
    acronym: "iyiditer",
    symbol: [
      [5, 4],
      [3, 2],
      [2, 3],
    ],
  },

  // Dodecadodecatwister variants
  {
    name: "dodecadodecatwister",
    acronym: "diditer",
    symbol: [5, [5, 2], 2],
  },
  {
    name: "great dodecaquasidodecatwister",
    acronym: "gidquiditer",
    symbol: [[5, 4], [5, 2], 2],
  },
  {
    name: "small dodecaquasidodecatwister",
    acronym: "sidquiditer",
    symbol: [5, [5, 3], 2],
    bug: "5/3 twisters have wrong filling method",
  },
  {
    name: "quasidodecadodecatwister",
    acronym: "quadiditer",
    symbol: [[5, 4], [5, 3], 2],
  },
  {
    name: "bloated dodecadodecatwister",
    acronym: "bladiditer",
    symbol: [5, [5, 2], [2, 3]],
  },
  {
    name: "great dodecabloated dodecatwister",
    acronym: "gidbliditer",
    symbol: [
      [5, 4],
      [5, 2],
      [2, 3],
    ],
  },
  {
    name: "small dodecabloated dodecatwister",
    acronym: "sidbliditer",
    symbol: [5, [5, 3], [2, 3]],
  },
  {
    name: "invertidodecadodecatwister",
    acronym: "idoditer",
    symbol: [
      [5, 4],
      [5, 3],
      [2, 3],
    ],
  },

  // Great icosidodecatwister variants
  {
    name: "great icosidodecatwister",
    acronym: "giditer",
    symbol: [[5, 2], 3, 2],
  },
  {
    name: "great icosiquasidodecatwister",
    acronym: "geiquiditer",
    symbol: [[5, 3], 3, 2],
  },
  {
    name: "great dodecaquasiicosatwister",
    acronym: "gidquiditer",
    symbol: [[5, 2], [3, 2], 2],
  },
  {
    name: "great quasiicosidodecatwister",
    acronym: "gequiditer",
    symbol: [[5, 3], [3, 2], 2],
  },
  {
    name: "great bloated icosidodecatwister",
    acronym: "gobliditer",
    symbol: [[5, 2], 3, [2, 3]],
  },
  {
    name: "great icosibloated dodecatwister",
    acronym: "geibliditer",
    symbol: [[5, 3], 3, [2, 3]],
  },
  {
    name: "great dodecabloated icosatwister",
    acronym: "gidbliditer",
    symbol: [
      [5, 2],
      [3, 2],
      [2, 3],
    ],
  },
  {
    name: "great invertiicosidodecatwister",
    acronym: "giyiditer",
    symbol: [
      [5, 3],
      [3, 2],
      [2, 3],
    ],
  },

  // Sheaved cases

  {
    name: "sheaved tetratwister",
    acronym: "vitter",
    symbol: [2, 3, 3],
  },
  {
    name: "quasisheaved tetratwister",
    acronym: "quivitter",
    symbol: [2, [3, 2], 3],
  },
  {
    name: "bloatosheaved tetratwister",
    acronym: "blivitter",
    symbol: [2, 3, [3, 2]],
  },
  {
    name: "invertisheaved tetratwister",
    acronym: "ivitter",
    symbol: [2, [3, 2], [3, 2]],
  },

  {
    name: "sheaved cube twister",
    acronym: "victer",
    symbol: [2, 4, 3],
  },
  {
    name: "quasisheaved cube twister",
    acronym: "quivicter",
    symbol: [2, [4, 3], 3],
  },
  {
    name: "bloatosheaved cube twister",
    acronym: "blivicter",
    symbol: [2, 4, [3, 2]],
    bug: "Incorrectly produces quasiplated cube twister",
  },
  {
    name: "invertisheaved cube twister",
    acronym: "ivicter",
    symbol: [2, [4, 3], [3, 2]],
    bug: "Incorrectly produces plated cube twister",
  },

  {
    name: "sheaved octatwister",
    acronym: "voter",
    symbol: [2, 3, 4],
  },
  {
    name: "quasisheaved octatwister",
    acronym: "quivicter",
    symbol: [2, [3, 2], 4],
  },
  {
    name: "bloatosheaved octatwister",
    acronym: "blivicter",
    symbol: [2, 3, [4, 3]],
    bug: "Incorrectly produces quasiplated octatwister",
  },
  {
    name: "invertisheaved octatwister",
    acronym: "ivicter",
    symbol: [2, [3, 2], [4, 3]],
    bug: "Incorrectly produces plated octatwister",
  },

  {
    name: "sheaved dodecatwister",
    acronym: "viditer",
    symbol: [2, 5, 3],
  },
  {
    name: "quasisheaved dodecatwister",
    acronym: "quividiter",
    symbol: [2, [5, 4], 3],
  },
  {
    name: "bloatosheaved dodecatwister",
    acronym: "blividiter",
    symbol: [2, 5, [3, 2]],
    bug: "Incorrectly produces quasiplated dodecatwister",
  },
  {
    name: "invertisheaved dodecatwister",
    acronym: "ividiter",
    symbol: [2, [5, 4], [3, 2]],
    bug: "Incorrectly produces plated dodecatwister",
  },

  {
    name: "sheaved icosatwister",
    acronym: "viketer",
    symbol: [2, 3, 5],
  },
  {
    name: "quasisheaved icosatwister",
    acronym: "quiviketer",
    symbol: [2, [3, 2], 5],
  },
  {
    name: "bloatosheaved icosatwister",
    acronym: "bliviketer",
    symbol: [2, 3, [5, 4]],
    bug: "Incorrectly produces quasiplated icosatwister",
  },
  {
    name: "invertisheaved icosatwister",
    acronym: "iviketer",
    symbol: [2, [3, 2], [5, 4]],
    bug: "Incorrectly produces plated icosatwister",
  },

  {
    name: "great sheaved dodecatwister",
    acronym: "goviditer",
    symbol: [2, 5, [5, 2]],
  },
  {
    name: "great quasisheaved dodecatwister",
    acronym: "gaquividiter",
    symbol: [2, [5, 4], [5, 2]],
  },
  {
    name: "great bloatosheaved dodecatwister",
    acronym: "gablividiter",
    symbol: [2, 5, [5, 3]],
    bug: "Incorrectly produces great quasiplated dodecatwister",
  },
  {
    name: "great invertisheaved dodecatwister",
    acronym: "gividiter",
    symbol: [2, [5, 4], [5, 3]],
    bug: "Incorrectly produces great plated dodecatwister",
  },

  {
    name: "stellisheaved dodecatwister",
    acronym: "sividiter",
    symbol: [2, [5, 2], 5],
  },
  {
    name: "quasistellisheaved dodecatwister",
    acronym: "quisviditer",
    symbol: [2, [5, 3], 5],
  },
  {
    name: "bloatostellisheaved dodecatwister",
    acronym: "blisviditer",
    symbol: [2, [5, 2], [5, 4]],
    bug: "Incorrectly produces quasistelliplated dodecatwister",
  },
  {
    name: "invertistellisheaved dodecatwister",
    acronym: "isviditer",
    symbol: [2, [5, 3], [5, 4]],
    bug: "Incorrectly produces stelliplated dodecatwister",
  },

  {
    name: "great sheaved icosatwister",
    acronym: "goviditer",
    symbol: [2, 3, [5, 2]],
  },
  {
    name: "great quasisheaved icosatwister",
    acronym: "gaquividiter",
    symbol: [2, [3, 2], [5, 2]],
  },
  {
    name: "great bloatosheaved icosatwister",
    acronym: "gablividiter",
    symbol: [2, 3, [5, 3]],
    bug: "Incorrectly produces great quasiplated icosatwister",
  },
  {
    name: "great invertisheaved icosatwister",
    acronym: "giviter",
    symbol: [2, [3, 2], [5, 3]],
    bug: "Incorrectly produces great plated icosatwister",
  },

  {
    name: "great stellisheaved dodecatwister",
    acronym: "gisviditer",
    symbol: [2, [5, 2], 3],
  },
  {
    name: "great quasistellisheaved dodecatwister",
    acronym: "gaqsviditer",
    symbol: [2, [5, 3], 3],
  },
  {
    name: "great bloatostellisheaved dodecatwister",
    acronym: "gablisviditer",
    symbol: [2, [5, 2], [3, 2]],
    bug: "Incorrectly produces great quasistelliplated dodecatwister",
  },
  {
    name: "great invertistellisheaved dodecatwister",
    acronym: "gise viditer",
    symbol: [2, [5, 3], [3, 2]],
    bug: "Incorrectly produces great stelliplated dodecatwister",
  },

  // Plated cases

  {
    name: "plated tetratwister",
    acronym: "potter",
    symbol: [2, 3, [3, 4]],
  },
  {
    name: "quasiplated tetratwister",
    acronym: "quipiter",
    symbol: [2, [3, 2], [3, 4]],
  },
  {
    name: "bloatoplated tetratwister",
    acronym: "blipiter",
    symbol: [2, 3, [3, 5]],
  },
  {
    name: "invertiplated tetratwister",
    acronym: "ipiter",
    symbol: [2, [3, 2], [3, 5]],
  },

  {
    name: "plated cube twister",
    acronym: "picter",
    symbol: [2, 4, [3, 4]],
  },
  {
    name: "quasiplated cube twister",
    acronym: "quipicter",
    symbol: [2, [4, 3], [3, 5]],
    bug: "Incorrectly produces invertiplated cube twister",
  },
  {
    name: "bloatoplated cube twister",
    acronym: "blipicter",
    symbol: [2, 4, [3, 5]],
  },
  {
    name: "invertiplated cube twister",
    acronym: "ipicter",
    symbol: [2, [4, 3], [3, 5]],
  },

  {
    name: "plated octatwister",
    acronym: "poter",
    symbol: [2, 3, [4, 5]],
  },
  {
    name: "quasiplated octatwister",
    acronym: "quipoter",
    symbol: [2, [3, 2], [4, 5]],
  },
  {
    name: "bloatoplated octatwister",
    acronym: "blipoter",
    symbol: [2, 3, [4, 7]],
  },
  {
    name: "invertiplated octatwister",
    acronym: "ipoter",
    symbol: [2, [3, 2], [4, 7]],
  },

  {
    name: "plated dodecatwister",
    acronym: "piditer",
    symbol: [2, 5, [3, 4]],
  },
  {
    name: "quasiplated dodecatwister",
    acronym: "quipiditer",
    symbol: [2, [5, 4], [3, 4]],
  },
  {
    name: "bloatoplated dodecatwister",
    acronym: "blipiditer",
    symbol: [2, 5, [3, 5]],
  },
  {
    name: "invertiplated dodecatwister",
    acronym: "ipiditer",
    symbol: [2, [5, 4], [3, 5]],
  },

  {
    name: "plated icosatwister",
    acronym: "piketer",
    symbol: [2, 3, [5, 6]],
  },
  {
    name: "quasiplated icosatwister",
    acronym: "quipiketer",
    symbol: [2, [3, 2], [5, 6]],
  },
  {
    name: "bloatoplated icosatwister",
    acronym: "blipiketer",
    symbol: [2, 3, [5, 9]],
  },
  {
    name: "invertiplated icosatwister",
    acronym: "ipiketer",
    symbol: [2, [3, 2], [5, 9]],
  },

  {
    name: "great plated dodecatwister",
    acronym: "gopiditer",
    symbol: [2, 5, [5, 7]],
  },
  {
    name: "great quasiplated dodecatwister",
    acronym: "gaquipiditer",
    symbol: [2, [5, 4], [5, 7]],
  },
  {
    name: "great bloatoplated dodecatwister",
    acronym: "gablipiditer",
    symbol: [2, 5, [5, 8]],
  },
  {
    name: "great invertiplated dodecatwister",
    acronym: "gipiditer",
    symbol: [2, [5, 4], [5, 8]],
  },

  {
    name: "stelliplated dodecatwister",
    acronym: "sipiditer",
    symbol: [2, [5, 2], [5, 6]],
  },
  {
    name: "quasistelliplated dodecatwister",
    acronym: "quispiditer",
    symbol: [2, [5, 3], [5, 6]],
  },
  {
    name: "bloatostelliplated dodecatwister",
    acronym: "blispiditer",
    symbol: [2, [5, 2], [5, 9]],
  },
  {
    name: "invertistelliplated dodecatwister",
    acronym: "ispiditer",
    symbol: [2, [5, 3], [5, 9]],
  },

  {
    name: "great plated icosatwister",
    acronym: "gopiditer",
    symbol: [2, 3, [5, 7]],
  },
  {
    name: "great quasiplated icosatwister",
    acronym: "gaquipiditer",
    symbol: [2, [3, 2], [5, 7]],
  },
  {
    name: "great bloatoplated icosatwister",
    acronym: "gablipiditer",
    symbol: [2, 3, [5, 8]],
  },
  {
    name: "great invertiplated icosatwister",
    acronym: "gipiter",
    symbol: [2, [3, 2], [5, 8]],
  },

  {
    name: "great stelliplated dodecatwister",
    acronym: "gispiditer",
    symbol: [2, [5, 2], [3, 4]],
  },
  {
    name: "great quasistelliplated dodecatwister",
    acronym: "gaqspiditer",
    symbol: [2, [5, 3], [3, 4]],
  },
  {
    name: "great bloatostelliplated dodecatwister",
    acronym: "gablispiditer",
    symbol: [2, [5, 2], [3, 5]],
  },
  {
    name: "great invertistelliplated dodecatwister",
    acronym: "gise piditer",
    symbol: [2, [5, 3], [3, 5]],
  },
];

export const database = new PolytwisterDatabase(specs);
