import { database } from "../src/polytwisterDefs";
import * as polytwisters from "../src/polytwisters";
import * as fs from "fs";

const def = database.findByID(process.argv[2]);

if (typeof def === "undefined") {
  throw new Error("Can't find def");
}

const polytwister = polytwisters.Polytwister.fromDef2(def);

fs.writeFile("out.json", JSON.stringify(polytwister.export(), null, 4), () => {});