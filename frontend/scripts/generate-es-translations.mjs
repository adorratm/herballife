/**
 * Generates es-translations-map.json for paths where es === en.
 */
import fs from "fs";
import path from "path";

const messagesDir = path.join(import.meta.dirname, "..", "messages");
const en = JSON.parse(fs.readFileSync(path.join(messagesDir, "en.json"), "utf8"));
const es = JSON.parse(fs.readFileSync(path.join(messagesDir, "es.json"), "utf8"));

const KEEP_IDENTICAL = new Set([
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
  for (const term of KEEP_IDENTICAL) {
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

async function myMemory(text) {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.slice(0, 480))}&langpair=en|es`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(String(res.status));
  const data = await res.json();
  const t = data?.responseData?.translatedText;
  if (!t || /MYMEMORY WARNING/i.test(t)) throw new Error("quota");
  return t;
}

async function translateOne(text) {
  if (!text.trim()) return text;
  const { out, tokens } = protect(text);
  const raw = await myMemory(out);
  return restore(raw, tokens);
}

const fe = flat(en);
const fl = flat(es);
const pending = Object.keys(fe).filter(
  (k) => typeof fe[k] === "string" && fl[k] === fe[k] && !KEEP_IDENTICAL.has(fe[k]),
);

console.log("pending", pending.length);
const map = {};
const CONCURRENCY = 6;
let idx = 0;

async function worker() {
  while (idx < pending.length) {
    const i = idx++;
    const key = pending[i];
    const src = fe[key];
    try {
      let t = await translateOne(src);
      if (t === src) {
        t = `${src} `;
        t = (await translateOne(src)).trim();
      }
      if (t && t !== src) map[key] = t;
    } catch (e) {
      console.warn("fail", key, e.message);
    }
    if (i > 0 && i % 50 === 0) console.log(i, "/", pending.length);
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));

fs.writeFileSync(
  path.join(import.meta.dirname, "es-translations-map.json"),
  `${JSON.stringify(map, null, 2)}\n`,
  "utf8",
);
console.log("wrote", Object.keys(map).length, "entries");
