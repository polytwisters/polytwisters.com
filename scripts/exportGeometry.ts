import { database } from "../src/polytwisterDefs";
import * as polytwisters from "../src/polytwisters";
import * as fs from "fs";

function writeJSON(jsonObject: any, outputFile: string) {
  fs.writeFile(outputFile, JSON.stringify(jsonObject, null, 4), () => {});
}

function main(argv) {
  let numArgsExpected = 2;
  let numArgsPassed = argv.length - 2;
  if (numArgsExpected !== numArgsPassed) {
    throw new Error(`${argv[1]} POLYTWISTER_NAME OUT_FILE`);
  }

  let polytwisterName = argv[2];
  let outputFile = argv[3];

  if (polytwisterName === "all") {
    let jsonObject = {
      polytwisters: database.defs.map((def) => {
        const polytwister = polytwisters.Polytwister.fromDef(def);
        return polytwister.export();
      })
    };
    writeJSON(jsonObject, outputFile);
  } else {
    const def = database.findByID(process.argv[2]);
    if (typeof def === "undefined") {
      throw new Error("Can't find def");
    }
    const polytwister = polytwisters.Polytwister.fromDef(def);
    writeJSON(polytwister.export(), outputFile);
  }
}

main(process.argv);