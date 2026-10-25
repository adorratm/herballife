import fs from "fs";
import path from "path";

const m = JSON.parse(
  fs.readFileSync(path.join(import.meta.dirname, "es-path-map-missing.json"), "utf8"),
);
const byEn = {};
for (const { path: p, en, tr } of m) {
  if (!byEn[en]) byEn[en] = { paths: [], tr };
  byEn[en].paths.push(p);
}
fs.writeFileSync(
  path.join(import.meta.dirname, "es-missing-by-en.json"),
  `${JSON.stringify(byEn, null, 2)}\n`,
);
console.log("unique", Object.keys(byEn).length);
