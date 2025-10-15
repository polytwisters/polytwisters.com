import { asFraction, FractionLike, fractionToString } from "./fraction";
import { PolytwisterSymbolLike } from "./symbol";
import { PolytwisterSymbol, SymmetrySymbol } from "./symbol";

/**
 * An object for inputting polytwister definitions.
 */
export interface PolytwisterDefSpec {
  name: string;
  acronym?: string;
  symbol: PolytwisterSymbolLike;
  bug?: string;
  index?: number; // 1-indexed.
}

/**
 * A polytwister definition, which is a symbol + name + acronym.
 */
export class PolytwisterDef {
  name: string;
  acronym?: string;
  bug?: string;
  symbol: PolytwisterSymbol;
  index?: number;

  constructor(spec: PolytwisterDefSpec) {
    this.name = spec.name;
    this.acronym = spec.acronym;
    this.symbol = PolytwisterSymbol.from(spec.symbol);
    this.bug = spec.bug;
    this.index = spec.index;
  }

  id(): string {
    return this.symbol.serializeURI();
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
      symmetryGroup: this.symbol.symmetrySymbol(),
      bug: this.bug,
      index: this.index,
      id: this.id(),
    };
  }

  asJSON(): any {
    return {
      name: this.name,
      acronym: this.acronym,
      index: this.index,
      symbol: this.symbol.asJSON(),
      symbolString: this.symbol.toString_(),
    };
  }
}

export interface PolytwisterFields {
  id: string;
  name: string;
  acronym?: string;
  symbol: PolytwisterSymbol;
  symbolString: string;
  regular: boolean;
  convex: boolean;
  dyadic: boolean;
  rectifiedDyadic: boolean;
  symmetryGroup: SymmetrySymbol;
  bug?: string;
  index?: number;
}

export class PolytwisterDatabase {
  defs: PolytwisterDef[];

  constructor(specs: PolytwisterDefSpec[]) {
    this.defs = specs.map((spec) => new PolytwisterDef(spec));
  }

  has(id: string): boolean {
    return this.findIndexByID(id) !== -1;
  }

  findByID(id: string): PolytwisterDef | undefined {
    return this.defs.find((def) => def.id() === id);
  }

  findIndexByID(id: string): number {
    return this.defs.findIndex((def) => def.id() === id);
  }

  indexToID(index: number): string {
    return this.defs[index].id();
  }

  getNextPolytwister(id: string): string {
    let index = this.findIndexByID(id);
    const newIndex = (index + 1) % this.defs.length;
    return this.defs[newIndex].id();
  }

  getPreviousPolytwister(id: string): string {
    let index = this.findIndexByID(id);
    const newIndex = (index - 1 + this.defs.length) % this.defs.length;
    return this.defs[newIndex].id();
  }

  asJSON(): any {
    return this.defs.map((x) => x.asJSON());
  }
}

function dyadicTwister(n: FractionLike, acronym: string): PolytwisterDefSpec {
  const result = {
    name: `${fractionToString(asFraction(n))} dyadic twister`,
    symbol: [2, n],
    acronym,
  };
  return result;
}

function rectifiedDyadicTwister(
  n: FractionLike,
  acronym: string,
): PolytwisterDefSpec {
  return {
    name: `${fractionToString(asFraction(n))} rectified dyadic twister`,
    symbol: [2, n, 2],
    acronym,
  };
}

function bloatedRectifiedDyadicTwister(
  n: FractionLike,
  acronym: string,
): PolytwisterDefSpec {
  return {
    name: `${fractionToString(asFraction(n))} bloated rectified dyadic twister`,
    symbol: [2, n, [2, 3]],
    acronym,
  };
}

const specsSporadic: PolytwisterDefSpec[] = [
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
    acronym: "siquissiditer",
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
    acronym: "gaquissiditer",
    symbol: [[5, 3], 3],
  },
  {
    name: "great bloatostellated dodecatwister",
    acronym: "goblessiditer",
    symbol: [
      [5, 2],
      [3, 2],
    ],
  },
  {
    name: "great invertostellated dodecatwister",
    acronym: "gansiditer",
    symbol: [
      [5, 3],
      [3, 2],
    ],
  },

  //////////////////////////////////////////////////////////////////////////////
  // Non-regular uniforms

  // Polytwisters with 2 in the numerator of the ring figure
  // (i.e. tetratetra/cubocta/icosidodecatwister variants).

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
    acronym: "gidquiter",
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
    acronym: "gidbliter",
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

  // Sheaved cases: at least one digonal twister.

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
  },
  {
    name: "invertisheaved cube twister",
    acronym: "ivicter",
    symbol: [2, [4, 3], [3, 2]],
  },

  {
    name: "sheaved octatwister",
    acronym: "voter",
    symbol: [2, 3, 4],
  },
  {
    name: "quasisheaved octatwister",
    acronym: "quivoter",
    symbol: [2, [3, 2], 4],
  },
  {
    name: "bloatosheaved octatwister",
    acronym: "blivoter",
    symbol: [2, 3, [4, 3]],
  },
  {
    name: "invertisheaved octatwister",
    acronym: "ivoter",
    symbol: [2, [3, 2], [4, 3]],
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
  },
  {
    name: "invertisheaved dodecatwister",
    acronym: "ividiter",
    symbol: [2, [5, 4], [3, 2]],
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
  },
  {
    name: "invertisheaved icosatwister",
    acronym: "iviketer",
    symbol: [2, [3, 2], [5, 4]],
  },

  {
    name: "great sheaved dodecatwister",
    acronym: "goviditer",
    symbol: [2, 5, [5, 2]],
  },
  {
    name: "great quasisheaved dodecatwister",
    acronym: "gaquaviditer",
    symbol: [2, [5, 4], [5, 2]],
  },
  {
    name: "great bloatosheaved dodecatwister",
    acronym: "gablaviditer",
    symbol: [2, 5, [5, 3]],
  },
  {
    name: "great invertisheaved dodecatwister",
    acronym: "gividiter",
    symbol: [2, [5, 4], [5, 3]],
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
  },
  {
    name: "invertistellisheaved dodecatwister",
    acronym: "isviditer",
    symbol: [2, [5, 3], [5, 4]],
  },

  {
    name: "great sheaved icosatwister",
    acronym: "goviter",
    symbol: [2, 3, [5, 2]],
  },
  {
    name: "great quasisheaved icosatwister",
    acronym: "gaquiviter",
    symbol: [2, [3, 2], [5, 2]],
  },
  {
    name: "great bloatosheaved icosatwister",
    acronym: "gabliviter",
    symbol: [2, 3, [5, 3]],
  },
  {
    name: "great invertisheaved icosatwister",
    acronym: "giviter",
    symbol: [2, [3, 2], [5, 3]],
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
  },
  {
    name: "great invertistellisheaved dodecatwister",
    acronym: "gise viditer",
    symbol: [2, [5, 3], [3, 2]],
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
    symbol: [2, [4, 3], [3, 4]],
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
    acronym: "gaquapiditer",
    symbol: [2, [5, 4], [5, 7]],
  },
  {
    name: "great bloatoplated dodecatwister",
    acronym: "gablapiditer",
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
    acronym: "gopiter",
    symbol: [2, 3, [5, 7]],
  },
  {
    name: "great quasiplated icosatwister",
    acronym: "gaquipiter",
    symbol: [2, [3, 2], [5, 7]],
  },
  {
    name: "great bloatoplated icosatwister",
    acronym: "gablipiter",
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

  // Special cases: polytwisters without 2's in any numerator.
  {
    name: "tetraretrotetratwister",
    acronym: "tritter",
    symbol: [[3, 2], 3, 3],
  },
  {
    name: "tetrabloated tetratwister",
    acronym: "tablitter",
    symbol: [[3, 2], 3, [3, 5]],
  },

  {
    name: "small cubiretro-octatwister",
    acronym: "sacroter",
    symbol: [[3, 2], 4, 4],
  },
  {
    name: "small ditetragonary cubioctatwister",
    acronym: "sadtacoter",
    symbol: [3, 4, [4, 3]],
  },
  {
    name: "great cubiretro-octatwister",
    acronym: "gacroter",
    symbol: [3, [4, 3], 4],
  },
  {
    name: "great ditetragonary cubioctatwister",
    acronym: "gadtacoter",
    symbol: [
      [3, 2],
      [4, 3],
      [4, 3],
    ],
  },
  {
    name: "cubiretrocubitwister",
    acronym: "cricter",
    symbol: [4, [4, 3], 3],
  },

  {
    name: "small cubibloated octatwister",
    acronym: "sacbloter",
    symbol: [[3, 2], 4, [4, 7]],
  },
  {
    name: "small ditetragonary bloated cubioctatwister",
    acronym: "sadtablicoter",
    symbol: [3, 4, [4, 5]],
  },
  {
    name: "great cubibloated octatwister",
    acronym: "gacbloter",
    symbol: [3, [4, 3], [4, 7]],
  },
  {
    name: "great ditetragonary bloated cubioctatwister",
    acronym: "gadtablicoter",
    symbol: [
      [3, 2],
      [4, 3],
      [4, 5],
    ],
  },
  {
    name: "cubibloated cubitwister",
    acronym: "cablicter",
    symbol: [4, [4, 3], [3, 5]],
  },

  {
    name: "small ditrigonary icosidodecatwister",
    acronym: "sidtiditer",
    symbol: [[5, 2], 3, 3],
  },
  {
    name: "great ditrigonary dodekicosatwister",
    acronym: "gidditditer",
    symbol: [
      [5, 2],
      [3, 2],
      [3, 2],
    ],
  },
  {
    name: "quasi ditrigonary icosidodecatwister",
    acronym: "quidtiditer",
    symbol: [[5, 3], [3, 2], 3],
  },
  {
    name: "grand ditrigonary icosidodecatwister",
    acronym: "gadtiditer",
    symbol: [[5, 3], 3, [3, 2]],
  },
  {
    name: "great icosicositwister",
    acronym: "giiter",
    symbol: [3, [3, 2], [5, 3]],
  },

  {
    name: "grand ditrigonary bloated icosidodecatwister",
    acronym: "gadtabliditer",
    symbol: [
      [5, 3],
      [3, 2],
      [3, 5],
    ],
  },
  {
    name: "small ditrigonary bloatododekicosatwister",
    acronym: "sidditbladiter",
    symbol: [[5, 3], 3, [3, 4]],
  },
  {
    name: "great quasiditrigonary bloatoicosidodecatwister",
    acronym: "gaquidtabliditer",
    symbol: [[5, 2], 3, [3, 5]],
  },
  {
    name: "small ditrigonary bloated icosidodecatwister",
    acronym: "sidtabliditer",
    symbol: [
      [5, 2],
      [3, 2],
      [3, 4],
    ],
  },
  {
    name: "small bloated icosicositwister",
    acronym: "sabliiter",
    symbol: [3, [3, 2], [5, 7]],
  },

  {
    name: "great quasiditrigonary icosidodecatwister",
    acronym: "gaquidtiditer",
    symbol: [
      [5, 4],
      [3, 2],
      [3, 2],
    ],
  },
  {
    name: "small ditrigonary dodekicosatwister",
    acronym: "sidditditer",
    symbol: [[5, 4], 3, 3],
  },
  {
    name: "great ditrigonary icosidodecatwister",
    acronym: "gidtiditer",
    symbol: [5, 3, [3, 2]],
  },
  {
    name: "medial ditrigonary icosidodecatwister",
    acronym: "midtiditer",
    symbol: [5, [3, 2], 3],
  },
  {
    name: "small icosicositwister",
    acronym: "siiter",
    symbol: [[3, 2], 3, 5],
  },

  {
    name: "quasi ditrigonary bloated icosidodecatwister",
    acronym: "quidtabliditer",
    symbol: [5, 3, [3, 4]],
  },
  {
    name: "great ditrigonary bloated dodekicosatwister",
    acronym: "gidditbladiter",
    symbol: [5, [3, 2], [3, 5]],
  },
  {
    name: "medial ditrigonary bloated icosidodecatwister",
    acronym: "midtabliditer",
    symbol: [
      [5, 4],
      [3, 2],
      [3, 4],
    ],
  },
  {
    name: "great ditrigonary bloated icosidodecatwister",
    acronym: "gidtabliditer",
    symbol: [[5, 4], 3, [3, 5]],
  },
  {
    name: "great bloated icosicositwister",
    acronym: "gabliiter",
    symbol: [3, [3, 2], [5, 9]],
  },

  {
    name: "small dodecaretroicosatwister",
    acronym: "sidriter",
    symbol: [[3, 2], 5, 5],
  },
  {
    name: "great retrododekicosatwister",
    acronym: "gorditer",
    symbol: [
      [3, 2],
      [5, 4],
      [5, 4],
    ],
  },
  {
    // Original page has a small typo with "dodecki-" instead of "dodeki-".
    name: "compact dodekicosatwister",
    acronym: "coditer",
    symbol: [3, 5, [5, 4]],
  },
  {
    name: "great icosiretrododecatwister",
    acronym: "giriditer",
    symbol: [3, [5, 4], 5],
  },
  {
    name: "small dodecaretrododecatwister",
    acronym: "sidraditer",
    symbol: [5, [5, 4], 3],
  },

  {
    name: "great icosibloatoretrododecatwister",
    acronym: "gibriditer",
    symbol: [3, [5, 4], [5, 9]],
  },
  {
    name: "bloated dodekicosatwister",
    acronym: "boditer",
    symbol: [3, 5, [5, 6]],
  },
  {
    name: "small bloatoretrododekicosatwister",
    acronym: "sabroditer",
    symbol: [
      [3, 2],
      [5, 4],
      [5, 6],
    ],
  },
  {
    name: "small dodecabloatoretroicosatwister",
    acronym: "sidbriter",
    symbol: [[3, 2], 5, [5, 9]],
  },
  {
    name: "great dodecabloatoretrododecatwister",
    acronym: "gidbraditer",
    symbol: [[5, 4], 5, [3, 5]],
  },

  {
    name: "great dodecaretroicositwister",
    acronym: "gidriter",
    symbol: [
      [3, 2],
      [5, 2],
      [5, 2],
    ],
  },
  {
    name: "small retrododekicositwister",
    acronym: "sorditer",
    symbol: [
      [3, 2],
      [5, 3],
      [5, 3],
    ],
  },
  {
    name: "small compact dodekicositwister",
    acronym: "scoditer",
    symbol: [3, [5, 2], [5, 3]],
  },
  {
    name: "small icosiretrododecatwister",
    acronym: "siriditer",
    symbol: [3, [5, 3], [5, 2]],
  },
  {
    name: "great dodecaretrododecatwister",
    acronym: "gidraditer",
    symbol: [[5, 2], [5, 3], 3],
  },

  {
    name: "small icosibloatoretrododecatwister",
    acronym: "sibriditer",
    symbol: [3, [5, 3], [5, 8]],
  },
  {
    name: "small bloated dodekicosatwister",
    acronym: "sibditer",
    symbol: [3, [5, 2], [5, 7]],
  },
  {
    name: "great bloatoretrododekicosatwister",
    acronym: "gabroditer",
    symbol: [
      [3, 2],
      [5, 3],
      [5, 7],
    ],
  },
  {
    name: "great dodecabloatoretroicosatwister",
    acronym: "gidbriter",
    symbol: [
      [3, 2],
      [5, 2],
      [5, 8],
    ],
  },
  {
    name: "small dodecabloatoretrododecatwister",
    acronym: "sidbraditer",
    symbol: [
      [5, 2],
      [5, 3],
      [3, 5],
    ],
  },

  {
    name: "dodecaretrododecatwister",
    acronym: "driditer",
    symbol: [[5, 4], 5, 5],
  },
  {
    name: "dipentagonary dodecadodecatwister",
    acronym: "dipdiditer",
    symbol: [
      [5, 2],
      [5, 3],
      [5, 3],
    ],
  },
  {
    name: "dodecabloatoretrododecatwister",
    acronym: "dabriditer",
    symbol: [[5, 4], 5, [5, 9]],
  },
  {
    name: "dipentagonary bloated dodecadodecatwister",
    acronym: "dipbladiditer",
    symbol: [
      [5, 2],
      [5, 3],
      [5, 7],
    ],
  },

  {
    name: "ditrigonary dodecadodecatwister",
    acronym: "ditdiditer",
    symbol: [[5, 3], 5, 3],
  },
  {
    name: "quasiditrigonary dodecadodecatwister",
    acronym: "quiditdiditer",
    symbol: [[5, 2], [5, 4], 3],
  },
  {
    name: "great ditrigonary dodecadodecatwister",
    acronym: "gadtadoditer",
    symbol: [
      [5, 3],
      [5, 4],
      [3, 2],
    ],
  },
  {
    name: "small ditrigonary dodecadodecatwister",
    acronym: "sadtadoditer",
    symbol: [[5, 2], 5, [3, 2]],
  },

  {
    name: "quasiditrigonary bloated dodecadodecatwister",
    acronym: "quiditbladiditer",
    symbol: [
      [5, 2],
      [5, 4],
      [3, 5],
    ],
  },
  {
    name: "ditrigonary bloated dodecadodecatwister",
    acronym: "ditbladiditer",
    symbol: [[5, 3], 5, [3, 5]],
  },
  {
    name: "small ditrigonary bloated dodecadodecatwister",
    acronym: "sidtablidoditer",
    symbol: [[5, 2], 5, [3, 4]],
  },
  {
    name: "great ditrigonary bloated dodecadodecatwister",
    acronym: "gidtablidoditer",
    symbol: [
      [5, 3],
      [5, 4],
      [3, 4],
    ],
  },

  {
    name: "small dipentagonary icosidodecatwister",
    acronym: "sidpiditer",
    symbol: [[5, 3], 3, 5],
  },
  {
    name: "small dipentagonary dodekicosatwister",
    acronym: "sidpoditer",
    symbol: [3, 5, [5, 3]],
  },
  {
    name: "great dipentagonary dodekicosatwister",
    acronym: "gidpoditer",
    symbol: [3, [5, 4], [5, 2]],
  },
  {
    name: "great dipentagonary icosidodecatwister",
    acronym: "gidpiditer",
    symbol: [3, [5, 2], [5, 4]],
  },

  {
    name: "grand dipentagonary bloated icosidodecatwister",
    acronym: "gadpablidoter",
    symbol: [
      [5, 2],
      [3, 2],
      [5, 9],
    ],
  },
  {
    name: "grand dipentagonary bloated dodekicosatwister",
    acronym: "gadpabloditer",
    symbol: [
      [3, 2],
      [5, 4],
      [5, 7],
    ],
  },
  // Why are these reversed in order on Bowers' page?
  {
    name: "medial dipentagonary bloated dodekicosatwister",
    acronym: "midpabloditer",
    symbol: [[3, 2], 5, [5, 8]],
  },
  {
    name: "medial dipentagonary bloated icosidodecatwister",
    acronym: "midpablidoter",
    symbol: [
      [3, 2],
      [5, 3],
      [5, 6],
    ],
  },

  {
    name: "grand dipentagonary dodekicosatwister",
    acronym: "gadpoditer",
    symbol: [
      [3, 2],
      [5, 4],
      [5, 3],
    ],
  },
  {
    name: "grand dipentagonary icosidodecatwister",
    acronym: "gadpiditer",
    symbol: [
      [3, 2],
      [5, 3],
      [5, 4],
    ],
  },
  {
    name: "medial dipentagonary dodekicosatwister",
    acronym: "midpoditer",
    symbol: [[3, 2], 5, [5, 2]],
  },
  {
    name: "medial dipentagonary icosidodecatwister",
    acronym: "midpiditer",
    symbol: [[3, 2], [5, 2], 5],
  },

  {
    name: "small dipentagonary bloated dodekicosatwister",
    acronym: "sadpabloditer",
    symbol: [3, 5, [5, 7]],
  },
  {
    name: "small dipentagonary bloated icosidodecatwister",
    acronym: "sadpablidoter",
    symbol: [3, [5, 2], [5, 6]],
  },
  {
    name: "great dipentagonary bloated dodekicosatwister",
    acronym: "gidpabloditer",
    symbol: [3, [5, 4], [5, 8]],
  },
  {
    name: "great dipentagonary bloated icosidodecatwister",
    acronym: "gidpablidoter",
    symbol: [3, [5, 3], [5, 9]],
  },
];

specsSporadic.forEach((spec, i) => {
  spec.index = i + 1;
});

const specsInfiniteFamilies = [
  dyadicTwister(3, "tridyster"),
  dyadicTwister([3, 2], "blotridyster"),
  dyadicTwister(4, "tetradyster"),
  dyadicTwister([4, 3], "blotetradyster"),
  dyadicTwister(5, "pentadyster"),
  dyadicTwister([5, 2], "stardyster"),
  dyadicTwister([5, 3], "blostardyster"),
  dyadicTwister([5, 4], "blopentadyster"),
  rectifiedDyadicTwister(3, "retridyster"),
  rectifiedDyadicTwister([3, 2], "rebtidyster"),
  rectifiedDyadicTwister(4, "retedyster"),
  rectifiedDyadicTwister([4, 3], "rebitdyster"),
  rectifiedDyadicTwister(5, "repdyster"),
  rectifiedDyadicTwister([5, 2], "restidyster"),
  rectifiedDyadicTwister([5, 3], "rebstidyster"),
  rectifiedDyadicTwister([5, 4], "rebipdyster"),
  bloatedRectifiedDyadicTwister(3, "britdyster"),
  bloatedRectifiedDyadicTwister([3, 2], "birbitdyster"),
  bloatedRectifiedDyadicTwister(4, "birtdyster"),
  bloatedRectifiedDyadicTwister([4, 3], "birbtedyster"),
  bloatedRectifiedDyadicTwister(5, "birpdyster"),
  bloatedRectifiedDyadicTwister([5, 2], "birstdyster"),
  bloatedRectifiedDyadicTwister([5, 3], "barbstdyster"),
  bloatedRectifiedDyadicTwister([5, 4], "birbipdyster"),
];

const specs: PolytwisterDefSpec[] = [
  ...specsSporadic,
  ...specsInfiniteFamilies,
];

export const database = new PolytwisterDatabase(specs);
