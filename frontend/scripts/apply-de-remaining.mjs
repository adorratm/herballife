/**
 * Apply scripts/de-map-remaining.json onto messages/de.json (same pattern as apply-de-map.mjs).
 */
import fs from "fs";
import path from "path";

const root = path.join(import.meta.dirname, "..", "messages");

const mapPath = path.join(import.meta.dirname, "de-map-remaining.json");
/** @type {Record<string, string>} */
const TRANSLATIONS = fs.existsSync(mapPath)
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

const needPath = path.join(import.meta.dirname, "de-en-remaining.json");
const need = fs.existsSync(needPath)
  ? JSON.parse(fs.readFileSync(needPath, "utf8"))
  : {};

let applied = 0;
for (const [dotPath, value] of Object.entries(TRANSLATIONS)) {
  if (!(dotPath in need)) {
    console.warn("skip (not in de-en-remaining):", dotPath);
    continue;
  }
  setPath(de, dotPath, value);
  applied++;
}

fs.writeFileSync(dePath, `${JSON.stringify(de, null, 2)}\n`, "utf8");

const fe = flat(en);
const fd = flat(de);
let identical = 0;
for (const k of Object.keys(fe)) {
  if (typeof fe[k] === "string" && fd[k] === fe[k]) identical++;
}

console.log("applied:", applied, "/", Object.keys(TRANSLATIONS).length);
console.log("identical de===en:", identical);
