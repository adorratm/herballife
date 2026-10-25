/**
 * Fills de/fr/es from en.json (resume-safe, rate-limit friendly).
 */
import fs from "fs";
import path from "path";
import { translate } from "@vitalets/google-translate-api";

const root = path.join(import.meta.dirname, "..", "messages");
const en = JSON.parse(fs.readFileSync(path.join(root, "en.json"), "utf8"));

const TARGETS = { de: "de", fr: "fr", es: "es" };
const BATCH_PER_LOCALE = 80;
const DELAY_MS = 1800;

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
  "Legal_Document",
  "SSL",
  "TLS",
  "PCI-DSS",
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

async function translateText(text, target) {
  const { out, tokens } = protect(text);
  for (let attempt = 0; attempt < 6; attempt++) {
    try {
      const res = await translate(out, { from: "en", to: target });
      return restore(res.text, tokens);
    } catch {
      await sleep(4000 * (attempt + 1));
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
      setPath(locale, key, translated);
      batch++;
      if (batch % 10 === 0) console.log(`  ${file}: ${batch}/${Math.min(BATCH_PER_LOCALE, pending.length)}`);
      await sleep(DELAY_MS);
    } catch {
      console.log(`  ${file}: stopping batch early (rate limit)`);
      break;
    }
  }
  fs.writeFileSync(filePath, `${JSON.stringify(locale, null, 2)}\n`, "utf8");
  console.log(`Wrote ${file}.json (+${batch} strings)`);
}
