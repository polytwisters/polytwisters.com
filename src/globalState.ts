import * as _ from "lodash";
import { ref, type Ref, computed, watch } from "vue";
import { Polytwister } from "./polytwisters";
import { PolytwisterSymbol } from "./symbol";
import { database } from "./polytwisterDefs";

const DEFAULT_POLYTWISTER_ID: string = "3.3";
const UNIFORM: string = "uniform=";

function parseHash(hash: string): string | null {
  if (hash[0] !== "#") {
    return null;
  }
  const tmp = hash.substring(1);
  if (tmp.startsWith(UNIFORM)) {
    const id = tmp.substring(UNIFORM.length);
    if (!id) {
      return null;
    }
    return id;
  }
  return null;
}

function getInitialPolytwisterID(): string {
  const hash = location.hash;
  if (hash[0] === "#") {
    const id = parseHash(hash);
    if (id) {
      if (database.has(id)) {
        return id;
      }
    }
  }
  return DEFAULT_POLYTWISTER_ID;
}

export const polytwisterID = ref(getInitialPolytwisterID());
export const polytwisterDef = computed(() => {
  const result = database.findByID(polytwisterID.value);
  if (result === undefined) {
    return database.findByID(DEFAULT_POLYTWISTER_ID)!;
  }
  return result;
});

export const polytwister: Ref<Polytwister> = computed(() =>
  Polytwister.fromDef2(polytwisterDef.value).normalized(),
);
export const polytwisterSymbol: Ref<PolytwisterSymbol> = computed(() =>
  PolytwisterSymbol.from(polytwisterDef.value.symbol),
);

watch(polytwisterID, (value) => {
  location.hash = `#${UNIFORM}${value}`;
});

export function next() {
  polytwisterID.value = database.getNextPolytwister(polytwisterID.value);
}

export function previous() {
  polytwisterID.value = database.getPreviousPolytwister(polytwisterID.value);
}

export function navigateTo(id: string) {
  if (database.has(id)) {
    polytwisterID.value = id;
  }
}

const randomHistory: string[] = [];

export function random() {
  if (randomHistory.length > 10) {
    randomHistory.shift();
  }
  randomHistory.push(polytwisterID.value);
  const allIDs = database.defs.map((def) => def.id());
  const validIDs = allIDs.filter((id) => randomHistory.indexOf(id) === -1);
  if (validIDs.length === 0) {
    polytwisterID.value = _.sample(allIDs)!;
  } else {
    polytwisterID.value = _.sample(validIDs)!;
  }
}

export const canvasSize: Ref<number> = ref(480);

export const crossSectionW: Ref<number> = ref(0);

export const takingScreenshot: Ref<boolean> = ref(false);
export function takeScreenshot() {
  takingScreenshot.value = true;
}