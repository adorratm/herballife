import fs from "fs";
import path from "path";

const root = path.join(import.meta.dirname, "..", "messages");
const en = JSON.parse(fs.readFileSync(path.join(root, "en.json"), "utf8"));
const es = JSON.parse(fs.readFileSync(path.join(root, "es.json"), "utf8"));

const EXACT = new Set([
  "Herbal Kapıda",
  "PayTR",
  "WhatsApp",
  "Google",
  "Herbal Kapıda",
  "KVKK",
  "IBAN",
  "DHL",
  "Formula 1",
  "HBL",
  "Instagram",
  "Blog",
  "FAQ",
  "SSL",
]);

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

const fe = flatWithArrays(en);
const fes = flatWithArrays(es);
const pathMap = {};
const byEn = {};

for (const k of Object.keys(fe)) {
  if (typeof fe[k] !== "string") continue;
  if (fes[k] !== fe[k]) continue;
  if (EXACT.has(fe[k])) continue;
  pathMap[k] = fe[k];
  byEn[fe[k]] = byEn[fe[k]] ?? [];
  byEn[fe[k]].push(k);
}

fs.writeFileSync(
  path.join(import.meta.dirname, "es-pending-paths.json"),
  `${JSON.stringify(pathMap, null, 2)}\n`,
);
fs.writeFileSync(
  path.join(import.meta.dirname, "es-unique-en.txt"),
  `${Object.keys(byEn).sort().join("\n")}\n`,
);
console.log("paths", Object.keys(pathMap).length);
console.log("unique en", Object.keys(byEn).length);
