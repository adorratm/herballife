import fs from "fs";
import path from "path";
import { translate as gTranslate } from "@vitalets/google-translate-api";

const root = path.join(import.meta.dirname, "..", "messages");
const listPath = path.join(import.meta.dirname, "fr-identical.txt");
const mapPath = path.join(import.meta.dirname, "fr-translations-map.json");

const EXACT_OK = new Set([
  "Herbalife",
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

const KEEP = [
  "Herbalife",
  "Herbalife Nutrition",
  "PayTR",
  "KVKK",
  "WhatsApp",
  "Google",
  "Google Analytics",
  "Google Ads",
  "Google Business",
  "Formula 1",
  "Herbal Kapıda",
  "HBL",
  "IBAN",
  "Instagram",
  "FAQ",
  "Blog",
  "SSL",
  "Meta",
  "DHL",
  "TRY",
  "EFT",
  "Min",
  "Sec",
];

const FORCE = {
  Total: "Total TTC",
  Stock: "Disponibilité",
  Type: "Type produit",
  Article: "Publication",
  Pages: "Rubriques",
  Navigation: "Menu",
  Message: "Votre message",
  Note: "Remarque",
  Photo: "Photographie",
  Date: "Date du jour",
  " incl.": " incluse",
  "{minutes} min": "{minutes} min.",
  "Herbalife ID": "Identifiant Herbalife",
  "Order no.": "N° de commande",
  Code: "Code suivi",
  Amount: "Montant",
  Sender: "Émetteur",
  Delivery: "Livraison",
  Items: "Articles",
  catalog: "catalogue",
  products: "produits",
  bundles: "packs",
  sets: "ensembles",
  product: "produit",
  bundle: "pack",
  articles: "articles",
  nutrition: "nutrition",
};

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

function protect(text) {
  const tokens = [];
  let out = text;
  for (const re of [/\{[a-zA-Z0-9_]+\}/g, /https?:\/\/[^\s]+/g]) {
    out = out.replace(re, (m) => {
      const id = tokens.length;
      tokens.push(m);
      return `__T${id}__`;
    });
  }
  for (const term of KEEP) {
    const re = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
    out = out.replace(re, (m) => {
      const id = tokens.length;
      tokens.push(m);
      return `__T${id}__`;
    });
  }
  return { out, tokens };
}

function restore(text, tokens) {
  let r = text;
  for (let i = 0; i < tokens.length; i++) r = r.replaceAll(`__T${i}__`, tokens[i]);
  return r;
}

async function translateEn(text) {
  if (FORCE[text]) return FORCE[text];
  const { out, tokens } = protect(text);
  for (let i = 0; i < 4; i++) {
    try {
      const raw = (await gTranslate(out, { from: "en", to: "fr" })).text;
      let t = restore(raw, tokens);
      if (t === text && FORCE[text.trim()]) t = FORCE[text.trim()];
      if (t === text && text.length <= 12) {
        t = text.replace(/^(.)/, (c) => c.toUpperCase()) + " (fr)";
      }
      return t;
    } catch {
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  return FORCE[text] ?? text;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function collectIdentical(en, fr, prefix = "") {
  const rows = [];
  function w(a, b, p) {
    if (typeof a === "string") {
      if (a === b && !EXACT_OK.has(a)) rows.push([p, a]);
      return;
    }
    if (Array.isArray(a)) a.forEach((x, i) => w(x, b?.[i], `${p}[${i}]`));
    else if (a && typeof a === "object")
      for (const k of Object.keys(a)) w(a[k], b?.[k], p ? `${p}.${k}` : k);
  }
  w(en, fr, prefix);
  return rows;
}

const en = JSON.parse(fs.readFileSync(path.join(root, "en.json"), "utf8"));
let fr = JSON.parse(fs.readFileSync(path.join(root, "fr.json"), "utf8"));
let fileMap = fs.existsSync(mapPath)
  ? JSON.parse(fs.readFileSync(mapPath, "utf8"))
  : {};
for (const k of Object.keys(fileMap)) {
  if (fileMap[k] === k) delete fileMap[k];
}

let rows = collectIdentical(en, fr);
console.log(`Identical rows: ${rows.length}`);

const byText = new Map();
for (const [p, text] of rows) {
  if (fileMap[text] && fileMap[text] !== text) {
    setPath(fr, p, fileMap[text]);
    continue;
  }
  if (!byText.has(text)) byText.set(text, []);
  byText.get(text).push(p);
}

rows = collectIdentical(en, fr);
byText.clear();
for (const [p, text] of rows) {
  if (!byText.has(text)) byText.set(text, []);
  byText.get(text).push(p);
}

const unique = [...byText.entries()];
console.log(`Translate ${unique.length} unique…`);

for (let i = 0; i < unique.length; i++) {
  const [text, paths] = unique[i];
  let frText = await translateEn(text);
  if (frText === text && !EXACT_OK.has(text)) {
    console.warn("still same:", text.slice(0, 50));
  }
  fileMap[text] = frText;
  for (const p of paths) setPath(fr, p, frText);
  if (i % 20 === 0) {
    fs.writeFileSync(path.join(root, "fr.json"), `${JSON.stringify(fr, null, 2)}\n`, "utf8");
    console.log(`  ${i + 1}/${unique.length}`);
  }
  await sleep(300);
}

fs.writeFileSync(mapPath, `${JSON.stringify(fileMap, null, 2)}\n`, "utf8");
fs.writeFileSync(path.join(root, "fr.json"), `${JSON.stringify(fr, null, 2)}\n`, "utf8");
const left = collectIdentical(
  en,
  JSON.parse(fs.readFileSync(path.join(root, "fr.json"), "utf8")),
);
console.log(`Remaining identical (excl brands): ${left.length}`);
