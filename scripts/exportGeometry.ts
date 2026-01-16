import { database } from "../src/polytwisterDefs";
import * as polytwisters from "../src/polytwisters";
import * as fs from "fs";

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
        return {
          def: def.asJSON(),
          geometry: polytwister.export()
        };
      })
    };
    // No indentation here as the output file is pretty big.
    fs.writeFile(outputFile, JSON.stringify(jsonObject), () => {});
  } else {
    const def = database.findByID(process.argv[2]);
    if (typeof def === "undefined") {
      throw new Error("Can't find def");
    }
    const polytwister = polytwisters.Polytwister.fromDef(def);
    const jsonObject = polytwister.export();
    // Use 4-space indentation here.
    fs.writeFile(outputFile, JSON.stringify(jsonObject, null, 4), () => {});
  }
}

main(process.argv);