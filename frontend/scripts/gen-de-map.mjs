/**
 * Generates German translations for de === en keys and writes de-map.json.
 */
import fs from "fs";
import path from "path";
import { translate as gTranslate } from "@vitalets/google-translate-api";

const KEEP = [
  "Herbal Kapıda",
  "PayTR",
  "KVKK",
  "WhatsApp",
  "Google",
  "Formula 1",
  "Herbal Kapıda",
  "HBL",
  "IBAN",
  "Instagram",
  "FAQ",
  "Blog",
  "SSL",
  "DHL",
];

const SKIP_IDENTICAL = new Set([
  "nav.blog",
  "nav.faq",
  "checkout.legalKvkkLink",
  "whatsapp.label",
  "product.specHerbal KapıdaId",
  "guestOrder.orderNumberPlaceholder",
  "notFoundPage.linkFaq",
  "legalSeo.kvkk.title",
]);

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function protect(text) {
  const tokens = [];
  let out = text;
  const patterns = [/\{[a-zA-Z0-9_]+\}/g, /%\{[a-zA-Z0-9_]+\}/g, /https?:\/\/[^\s]+/g];
  for (const re of patterns) {
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
  for (let i = 0; i < tokens.length; i++) {
    r = r.replaceAll(`__T${i}__`, tokens[i]);
    r = r.replaceAll(`__t${i}__`, tokens[i]);
  }
  return r;
}

async function translateText(text) {
  if (!text.trim()) return text;
  if (/^you@example\.com$/i.test(text)) return "ihre@beispiel.de";
  if (/^[A-Z0-9_./\-…]+$/.test(text) && text.length <= 16) return text;
  const { out, tokens } = protect(text);
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const raw = (await gTranslate(out, { from: "en", to: "de" })).text;
      return restore(raw, tokens);
    } catch (e) {
      await sleep(3000 * (attempt + 1));
    }
  }
  throw new Error(`failed: ${text.slice(0, 40)}`);
}

const needPath = path.join(import.meta.dirname, "de-need.json");
const need = JSON.parse(fs.readFileSync(needPath, "utf8"));
const outPath = path.join(import.meta.dirname, "de-map.json");
const existing = fs.existsSync(outPath)
  ? JSON.parse(fs.readFileSync(outPath, "utf8"))
  : {};

const keys = Object.keys(need).filter((k) => !SKIP_IDENTICAL.has(k));
console.log("to translate:", keys.length);

for (let i = 0; i < keys.length; i++) {
  const k = keys[i];
  if (existing[k] && existing[k] !== need[k]) {
    continue;
  }
  process.stdout.write(`[${i + 1}/${keys.length}] ${k}\n`);
  existing[k] = await translateText(need[k]);
  fs.writeFileSync(outPath, `${JSON.stringify(existing, null, 2)}\n`, "utf8");
  await sleep(800);
}

console.log("done", Object.keys(existing).length);
