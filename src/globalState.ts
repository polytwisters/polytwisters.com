import { ref, computed, watch } from "vue";
import { database } from "./polytwisterDefs";

const DEFAULT_POLYTWISTER_NAME: string = "tetratwister";
const UNIFORM: string = "uniform";

function deserializeName(name: string): string {
  return name.toLowerCase().replace(/_/g, " ");
}

function serializeName(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "_");
}

function parseHash(hash: string): string | null {
  if (hash[0] !== "#") {
    return null;
  }
  const tmp = hash.substring(1);
  const parts = tmp.split("/");
  if (parts[0] !== "") {
    return null;
  }
  if (!parts[1]) {
    return null;
  }
  if (parts[1] === UNIFORM) {
    const name = parts[2];
    if (!name) {
      return null;
    }
    return deserializeName(name);
  }
  return null;
}

function getInitialPolytwisterName() {
  const hash = location.hash;
  if (hash[0] === "#") {
    const name = parseHash(hash);
    if (name) {
      if (database.has(name)) {
        return name;
      }
    }
  }
  return DEFAULT_POLYTWISTER_NAME;
}

export const polytwisterName = ref(getInitialPolytwisterName());
export const polytwisterDef = computed(() => {
  const result = database.findByName(polytwisterName.value);
  if (result === undefined) {
    return database.findByName(DEFAULT_POLYTWISTER_NAME)!;
  }
  return result;
});

watch(polytwisterName, (value) => {
  location.hash = `#/${UNIFORM}/${serializeName(value)}`;
});

export function next() {
  polytwisterName.value = database.getNextPolytwister(polytwisterName.value);
}

export function previous() {
  polytwisterName.value = database.getPreviousPolytwister(polytwisterName.value);
}