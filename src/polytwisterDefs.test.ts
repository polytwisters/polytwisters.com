import { test, expect } from "vitest";
import { database } from "./polytwisterDefs";

test("All names are unique", () => {
  const names = database.defs.map((x) => x.name);
  const uniqueNames = [...new Set(names)];
  expect(names.length).toBe(uniqueNames.length);
});

test("All acronyms are unique", () => {
  const defs = database.defs.filter((x) => x.acronym !== undefined);
  for (let i = 0; i < defs.length; i++) {
    for (let j = i + 1; j < defs.length; j++) {
      if (i !== j) {
        expect.soft(defs[i].acronym).not.toBe(defs[j].acronym);
      }
    }
  }
});

test("All symbols unique", () => {
  const defs = database.defs;
  for (let i = 0; i < defs.length; i++) {
    // Although .equals is commutative, good to be safe and check both
    // directions.
    for (let j = 0; j < defs.length; j++) {
      if (i !== j) {
        expect.soft(defs[i].symbol.equals(defs[j].symbol)).toBeFalsy;
      }
    }
  }
});

test("All acronyms and names start with the same letter", () => {
  const defs = database.defs.filter((x) => x.acronym !== undefined);
  for (let { name, acronym, symbol } of defs) {
    if (!symbol.isInInfiniteFamily()) {
      expect(acronym![0]).toBe(
        name.startsWith("sheaved") ? "v" : name[0]
      );
    }
  }
});

test("All names are lowercase and end with -twister", () => {
  for (let { name } of database.defs) {
    expect(name).toMatch(/^[a-z0-9\/\- ]+twister$/);
  }
});

test("All acronyms are lowercase and end with -ter", () => {
  for (let { acronym } of database.defs) {
    if (acronym !== undefined) {
      expect(acronym).toMatch(/^[a-z ]+ter$/);
    }
  }
});