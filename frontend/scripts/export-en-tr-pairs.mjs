import fs from "fs";
import path from "path";

const root = path.join(import.meta.dirname, "..", "messages");
const pending = JSON.parse(
  fs.readFileSync(path.join(import.meta.dirname, "es-pending-paths.json"), "utf8"),
);
const tr = JSON.parse(fs.readFileSync(path.join(root, "tr.json"), "utf8"));

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

const pairs = [];
for (const [p, en] of Object.entries(pending)) {
  pairs.push({ path: p, en, tr: getPath(tr, p) });
}
fs.writeFileSync(
  path.join(import.meta.dirname, "es-en-tr-pairs.json"),
  `${JSON.stringify(pairs, null, 2)}\n`,
);
console.log("pairs", pairs.length);
