import fs from "fs";
import path from "path";

const en = JSON.parse(
  fs.readFileSync(path.join(import.meta.dirname, "..", "messages", "en.json"), "utf8"),
);
const es = JSON.parse(
  fs.readFileSync(path.join(import.meta.dirname, "..", "messages", "es.json"), "utf8"),
);

const paths = [];
function w(a, b, p = "") {
  if (typeof a === "string") {
    if (a === b) paths.push({ p, v: a });
    return;
  }
  if (a && typeof a === "object" && !Array.isArray(a)) {
    for (const k of Object.keys(a)) w(a[k], b && b[k], p ? `${p}.${k}` : k);
  }
}
w(en, es);
for (const x of paths) console.log(x.p, "=", JSON.stringify(x.v));
