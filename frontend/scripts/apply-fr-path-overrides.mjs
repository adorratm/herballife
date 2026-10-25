import fs from "fs";
import path from "path";

const root = path.join(import.meta.dirname, "..", "messages");
const overrides = JSON.parse(
  fs.readFileSync(path.join(import.meta.dirname, "fr-path-overrides.json"), "utf8"),
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

function setPath(obj, dotPath, value) {
  const parts = parsePath(dotPath);
  let c = obj;
  for (let i = 0; i < parts.length - 1; i++) c = c[parts[i]];
  c[parts[parts.length - 1]] = value;
}

const fr = JSON.parse(fs.readFileSync(path.join(root, "fr.json"), "utf8"));
for (const [p, v] of Object.entries(overrides)) {
  setPath(fr, p, v);
}
fs.writeFileSync(path.join(root, "fr.json"), `${JSON.stringify(fr, null, 2)}\n`, "utf8");
console.log(`Applied ${Object.keys(overrides).length} path overrides.`);
