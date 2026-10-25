import fs from "fs";
import path from "path";

const root = path.join(import.meta.dirname, "..", "messages");

const mapPath = path.join(import.meta.dirname, "de-map.json");
/** @type {Record<string, string>} */
export const TRANSLATIONS = fs.existsSync(mapPath)
  ? JSON.parse(fs.readFileSync(mapPath, "utf8"))
  : {};

function setPath(obj, dotPath, value) {
  const parts = dotPath.split(".");
  let c = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    c[parts[i]] = c[parts[i]] ?? {};
    c = c[parts[i]];
  }
  c[parts[parts.length - 1]] = value;
}

function flat(o, p = "") {
  const r = {};
  for (const k of Object.keys(o)) {
    const key = p ? `${p}.${k}` : k;
    if (o[k] && typeof o[k] === "object" && !Array.isArray(o[k])) {
      Object.assign(r, flat(o[k], key));
    } else {
      r[key] = o[k];
    }
  }
  return r;
}

const en = JSON.parse(fs.readFileSync(path.join(root, "en.json"), "utf8"));
const dePath = path.join(root, "de.json");
const de = JSON.parse(fs.readFileSync(dePath, "utf8"));

for (const [dotPath, value] of Object.entries(TRANSLATIONS)) {
  setPath(de, dotPath, value);
}

fs.writeFileSync(dePath, `${JSON.stringify(de, null, 2)}\n`, "utf8");

const fe = flat(en);
const fd = flat(de);
let identical = 0;
for (const k of Object.keys(fe)) {
  if (typeof fe[k] === "string" && fd[k] === fe[k]) identical++;
}
console.log("applied:", Object.keys(TRANSLATIONS).length);
console.log("identical de===en:", identical);
