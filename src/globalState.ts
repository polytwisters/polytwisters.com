import { ref, computed } from "vue";
import { database } from "./polytwisterDefs";

export const polytwisterName = ref("tetratwister");
export const polytwisterDef = computed(() => {
  const result = database.findByName(polytwisterName.value);
  if (result === undefined) {
    return database.findByName("tetratwister")!;
  }
  return result;
});