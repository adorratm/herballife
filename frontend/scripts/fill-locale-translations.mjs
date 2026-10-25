/**
 * Fills de/fr/es from en.json (resume-safe).
 * Prefers MyMemory; falls back to @vitalets/google-translate-api.
 */
import fs from "fs";
import path from "path";
import { translate as gTranslate } from "@vitalets/google-translate-api";

const root = path.join(import.meta.dirname, "..", "messages");
const en = JSON.parse(fs.readFileSync(path.join(root, "en.json"), "utf8"));

const TARGETS = process.argv.slice(2).length
  ? Object.fromEntries(process.argv.slice(2).map((l) => [l, l]))
  : { de: "de", fr: "fr", es: "es" };

const BATCH_PER_LOCALE = Number(process.env.I18N_BATCH || 120);
const DELAY_MS = Number(process.env.I18N_DELAY || 2500);

const KEEP = [
  "Herbalife",
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
  "Coaching",
  "SSL",
  "TLS",
  "PCI-DSS",
  "DHL",
];

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

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

function setPath(obj, dotPath, value) {
  const parts = dotPath.split(".");
  let c = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    c[parts[i]] = c[parts[i]] ?? {};
    c = c[parts[i]];
  }
  c[parts[parts.length - 1]] = value;
}

function deepMergeStructure(target, source) {
  for (const key of Object.keys(source)) {
    const sv = source[key];
    if (
      sv &&
      typeof sv === "object" &&
      !Array.isArray(sv) &&
      target[key] &&
      typeof target[key] === "object" &&
      !Array.isArray(target[key])
    ) {
      deepMergeStructure(target[key], sv);
    } else if (!(key in target)) {
      target[key] = structuredClone(sv);
    }
  }
  return target;
}

function protect(text) {
  const tokens = [];
  let out = text;
  const patterns = [/\{[a-zA-Z0-9_]+\}/g, /https?:\/\/[^\s]+/g];
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

async function myMemory(text, target) {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${target}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`mymemory ${res.status}`);
  const data = await res.json();
  const translated = data?.responseData?.translatedText;
  if (!translated || /MYMEMORY WARNING/i.test(translated)) {
    throw new Error("mymemory quota");
  }
  return translated;
}

async function translateText(text, target) {
  if (!text.trim() || text.length < 2) return text;
  // Identical short tokens / codes — keep
  if (/^[A-Z0-9_./\-]+$/.test(text) && text.length <= 12) return text;
  const { out, tokens } = protect(text);
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const raw =
        attempt % 2 === 0
          ? await myMemory(out, target)
          : (await gTranslate(out, { from: "en", to: target })).text;
      return restore(raw, tokens);
    } catch {
      await sleep(5000 * (attempt + 1));
    }
  }
  throw new Error("rate limited");
}

const fe = flat(en);

for (const [file, lang] of Object.entries(TARGETS)) {
  const filePath = path.join(root, `${file}.json`);
  let locale = JSON.parse(fs.readFileSync(filePath, "utf8"));
  deepMergeStructure(locale, structuredClone(en));
  const fl = flat(locale);
  const pending = Object.keys(fe).filter(
    (k) => typeof fe[k] === "string" && fl[k] === fe[k],
  );
  console.log(`${file}: ${pending.length} pending`);
  let batch = 0;
  for (const key of pending) {
    if (batch >= BATCH_PER_LOCALE) break;
    try {
      const translated = await translateText(fe[key], lang);
      if (translated && translated !== fe[key]) {
        setPath(locale, key, translated);
      }
      batch++;
      if (batch % 15 === 0) {
        console.log(
          `  ${file}: ${batch}/${Math.min(BATCH_PER_LOCALE, pending.length)}`,
        );
        fs.writeFileSync(filePath, `${JSON.stringify(locale, null, 2)}\n`, "utf8");
      }
      await sleep(DELAY_MS);
    } catch (e) {
      console.log(`  ${file}: stopping early — ${e.message || e}`);
      break;
    }
  }
  fs.writeFileSync(filePath, `${JSON.stringify(locale, null, 2)}\n`, "utf8");
  console.log(`Wrote ${file}.json (+${batch} attempted)`);
}
