import { database } from "../src/polytwisterDefs";
import * as fs from "fs";

fs.writeFile("out.json", JSON.stringify(database.asJSON()), () => {});
