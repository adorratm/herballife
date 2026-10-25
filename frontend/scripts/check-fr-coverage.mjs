import fs from "fs";
import path from "path";

const m = JSON.parse(
  fs.readFileSync(path.join(import.meta.dirname, "es-path-map-missing.json"), "utf8"),
);
const en = JSON.parse(
  fs.readFileSync(path.join(import.meta.dirname, "..", "messages", "en.json"), "utf8"),
);
const fr = JSON.parse(
  fs.readFileSync(path.join(import.meta.dirname, "..", "messages", "fr.json"), "utf8"),
);

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

function getPath(obj, dotPath) {
  const parts = parsePath(dotPath);
  let c = obj;
  for (const p of parts) c = c?.[p];
  return c;
}

let frDone = 0;
let frSame = 0;
for (const x of m) {
  const fv = getPath(fr, x.path);
  const ev = getPath(en, x.path);
  if (fv === ev) frSame++;
  else if (fv && fv !== ev) frDone++;
}
console.log({ total: m.length, frDone, frSame });
