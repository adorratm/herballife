/**
 * Incrementally build es-path-map.json from es-en-tr-pairs + chunk files.
 */
import fs from "fs";
import path from "path";

const dir = import.meta.dirname;
const pairs = JSON.parse(
  fs.readFileSync(path.join(dir, "es-en-tr-pairs.json"), "utf8"),
);

/** @type {Record<string, string>} */
let map = {};
const mapPath = path.join(dir, "es-path-map.json");
if (fs.existsSync(mapPath)) {
  map = JSON.parse(fs.readFileSync(mapPath, "utf8"));
}

for (const chunk of fs
  .readdirSync(dir)
  .filter((f) => /^es-chunk-\d+\.json$/.test(f))
  .sort()) {
  Object.assign(map, JSON.parse(fs.readFileSync(path.join(dir, chunk), "utf8")));
}

const pending = Object.fromEntries(pairs.map((p) => [p.path, p.en]));
const missing = [];
for (const [p, en] of Object.entries(pending)) {
  if (!map[p]) missing.push({ path: p, en, tr: pairs.find((x) => x.path === p)?.tr });
}

fs.writeFileSync(mapPath, `${JSON.stringify(map, null, 2)}\n`);
fs.writeFileSync(
  path.join(dir, "es-path-map-missing.json"),
  `${JSON.stringify(missing, null, 2)}\n`,
);
console.log("map size", Object.keys(map).length, "missing", missing.length);
