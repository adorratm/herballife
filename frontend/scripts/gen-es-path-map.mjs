/**
 * Builds es-path-map.json from es-pending-paths + es-en-dict.mjs
 */
import fs from "fs";
import path from "path";
import { EN_TO_ES } from "./es-en-dict.mjs";

const pending = JSON.parse(
  fs.readFileSync(path.join(import.meta.dirname, "es-pending-paths.json"), "utf8"),
);

const out = {};
const missing = [];
for (const [dotPath, enText] of Object.entries(pending)) {
  const es = EN_TO_ES[enText];
  if (es) out[dotPath] = es;
  else missing.push({ dotPath, enText });
}

fs.writeFileSync(
  path.join(import.meta.dirname, "es-path-map.json"),
  `${JSON.stringify(out, null, 2)}\n`,
);
console.log("mapped", Object.keys(out).length, "missing", missing.length);
if (missing.length) {
  fs.writeFileSync(
    path.join(import.meta.dirname, "es-path-map-missing.json"),
    `${JSON.stringify(missing, null, 2)}\n`,
  );
}
