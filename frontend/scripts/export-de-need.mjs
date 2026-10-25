import fs from "fs";
import path from "path";

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

const root = path.join(import.meta.dirname, "..", "messages");
const en = JSON.parse(fs.readFileSync(path.join(root, "en.json"), "utf8"));
const de = JSON.parse(fs.readFileSync(path.join(root, "de.json"), "utf8"));
const fe = flat(en);
const fd = flat(de);
const need = {};
for (const k of Object.keys(fe)) {
  if (typeof fe[k] === "string" && fd[k] === fe[k]) need[k] = fe[k];
}
fs.writeFileSync(
  path.join(import.meta.dirname, "de-need.json"),
  JSON.stringify(need, null, 2),
);
console.log("keys:", Object.keys(need).length);
