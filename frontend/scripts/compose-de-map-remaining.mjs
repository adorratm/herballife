/**
 * Compose de-map-remaining.json from de-en-remaining.json + de-value-map.json
 */
import fs from "fs";
import path from "path";

const dir = import.meta.dirname;
const need = JSON.parse(fs.readFileSync(path.join(dir, "de-en-remaining.json"), "utf8"));
const valueMap = JSON.parse(fs.readFileSync(path.join(dir, "de-value-map.json"), "utf8"));

const KEEP_WHOLE = new Set([
  "Blog",
  "FAQ",
  "KVKK",
  "WhatsApp",
  "Herbal Kapıda",
  "Google",
  "Herbal Kapıda",
  "IBAN",
  "DHL",
  "SSL",
  "Formula 1",
  "Herbal Kapıda ID",
  "Marketing (Google Ads / Meta)",
  "Version {version}",
  "HBL-…",
]);

function keepWhole(text) {
  if (KEEP_WHOLE.has(text)) return true;
  if (/^HBL-/.test(text)) return true;
  return false;
}

const out = {};
const missing = [];
for (const [k, en] of Object.entries(need)) {
  if (keepWhole(en)) {
    out[k] = en;
    continue;
  }
  const de = valueMap[en];
  if (!de) {
    missing.push(en);
    out[k] = en;
  } else {
    out[k] = de;
  }
}

fs.writeFileSync(
  path.join(dir, "de-map-remaining.json"),
  `${JSON.stringify(out, null, 2)}\n`,
  "utf8",
);

console.log("keys", Object.keys(out).length);
console.log("missing value translations", missing.length);
if (missing.length) {
  console.log("sample missing:", missing.slice(0, 5));
}
