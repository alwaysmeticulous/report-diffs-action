import { readFileSync, writeFileSync } from "fs";
import { parse, stringify } from "yaml";

const actionFile = parse(readFileSync("action.yml", "utf-8").toString());
const modifiedActionFile = {
  ...actionFile,
  runs: {
    ...actionFile.runs,
    image: "Dockerfile"
  }
};
writeFileSync("action.yml", stringify(modifiedActionFile), { encoding: "utf-8" });
