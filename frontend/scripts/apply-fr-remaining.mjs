/**
 * Apply scripts/fr-map-remaining.json onto messages/fr.json (path → French).
 */
import fs from "fs";
import path from "path";

const root = path.join(import.meta.dirname, "..", "messages");
const mapPath = path.join(import.meta.dirname, "fr-map-remaining.json");
const needPath = path.join(import.meta.dirname, "fr-en-remaining.json");

/** @type {Record<string, string>} */
const TRANSLATIONS = fs.existsSync(mapPath)
  ? JSON.parse(fs.readFileSync(mapPath, "utf8"))
  : {};

function parsePath(pathStr) {
  const parts = [];
  const re = /([^.[\]]+)|\[(\d+)\]/g;
  let m;
  while ((m = re.exec(pathStr)) !== null) {
    if (m[1]) parts.push(m[1]);
    else if (m[2] !== undefined) parts.push(Number(m[2]));
  }
  return parts;
}

function setPath(obj, dotPath, value) {
  const parts = parsePath(dotPath);
  let c = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (c[p] === undefined || c[p] === null) {
      c[p] = typeof parts[i + 1] === "number" ? [] : {};
    }
    c = c[p];
  }
  c[parts[parts.length - 1]] = value;
}

function flatWithArrays(o, p = "") {
  const r = {};
  for (const k of Object.keys(o)) {
    const key = p ? `${p}.${k}` : k;
    const v = o[k];
    if (Array.isArray(v)) {
      v.forEach((item, i) => {
        if (item && typeof item === "object") {
          Object.assign(r, flatWithArrays(item, `${key}[${i}]`));
        } else {
          r[`${key}[${i}]`] = item;
        }
      });
    } else if (v && typeof v === "object") {
      Object.assign(r, flatWithArrays(v, key));
    } else {
      r[key] = v;
    }
  }
  return r;
}

const en = JSON.parse(fs.readFileSync(path.join(root, "en.json"), "utf8"));
const frPath = path.join(root, "fr.json");
const fr = JSON.parse(fs.readFileSync(frPath, "utf8"));

const need = fs.existsSync(needPath)
  ? JSON.parse(fs.readFileSync(needPath, "utf8"))
  : {};

let applied = 0;
for (const [dotPath, value] of Object.entries(TRANSLATIONS)) {
  if (!(dotPath in need)) {
    console.warn("skip (not in fr-en-remaining):", dotPath);
    continue;
  }
  setPath(fr, dotPath, value);
  applied++;
}

fs.writeFileSync(frPath, `${JSON.stringify(fr, null, 2)}\n`, "utf8");

const fe = flatWithArrays(en);
const ff = flatWithArrays(fr);
let identical = 0;
for (const k of Object.keys(fe)) {
  if (typeof fe[k] === "string" && ff[k] === fe[k]) identical++;
}

console.log("applied:", applied, "/", Object.keys(TRANSLATIONS).length);
console.log("identical fr===en:", identical);
