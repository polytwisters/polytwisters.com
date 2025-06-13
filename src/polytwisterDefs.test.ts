import { test, expect } from "vitest";
import { database } from "./polytwisterDefs";

test("All names are unique", () => {
  const names = database.defs.map((x) => x.name);
  const uniqueNames = [...new Set(names)];
  expect(names.length).toBe(uniqueNames.length);
});

test("All acronyms are unique", () => {
  const acronyms = database.defs.map((x) => x.name).filter((x) => x !== undefined);
  const uniqueAcronyms = [...new Set(acronyms)];
  expect(acronyms.length).toBe(uniqueAcronyms.length);
});