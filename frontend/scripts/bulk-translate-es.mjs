/**
 * One-off: translate all es.json strings still identical to en.json.
 */
import fs from "fs";
import path from "path";
import { translate as gTranslate } from "@vitalets/google-translate-api";

const messagesDir = path.join(import.meta.dirname, "..", "messages");
const en = JSON.parse(fs.readFileSync(path.join(messagesDir, "en.json"), "utf8"));
let es = JSON.parse(fs.readFileSync(path.join(messagesDir, "es.json"), "utf8"));

const KEEP_EXACT = new Set([
  "Herbal Kapıda",
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

const MANUAL = {
  "common.genericError": "Error",
  "common.previous": "Anterior",
  "common.next": "Siguiente",
  "nav.home": "Inicio",
  "nav.coaching": "Acompañamiento",
  "nav.mobileMenu": "Menú móvil",
  "nav.orders": "Mis pedidos",
  "nav.nutritionTracking": "Seguimiento nutricional",
  "nav.measurements": "Mis mediciones",
  "nav.progressReport": "Informe de progreso",
  "nav.notifications": "Notificaciones",
  "nav.cargoTracking": "Seguimiento de envío",
  "nav.googleReview": "Reseña en Google",
  "cart.subtotal": "Subtotal",
  "cart.viewCart": "Ver carrito",
  "home.fallbackFaqTitle": "Preguntas frecuentes",
  "home.productCount": "{count} productos",
  "home.productsComingSoon": "Productos próximamente.",
};

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
  for (const term of [...KEEP_EXACT, "Coaching"]) {
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

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function translateText(text) {
  if (!text.trim()) return text;
  const { out, tokens } = protect(text);
  for (let attempt = 0; attempt < 6; attempt++) {
    try {
      const raw = (await gTranslate(out, { from: "en", to: "es" })).text;
      return restore(raw, tokens);
    } catch {
      await sleep(3000 * (attempt + 1));
    }
  }
  return text;
}

const fe = flat(en);
const fl = flat(es);
let pending = Object.keys(fe).filter(
  (k) => typeof fe[k] === "string" && fl[k] === fe[k] && !KEEP_EXACT.has(fe[k]),
);

for (const [k, v] of Object.entries(MANUAL)) {
  if (fe[k] === fl[k] || fl[k] === fe[k]) {
    setPath(es, k, v);
  }
}

pending = Object.keys(fe).filter(
  (k) =>
    typeof fe[k] === "string" &&
    flat(es)[k] === fe[k] &&
    !KEEP_EXACT.has(fe[k]) &&
    !(k in MANUAL),
);

console.log(`Translating ${pending.length} keys…`);
const map = {};
let done = 0;
for (const key of pending) {
  const src = fe[key];
  let translated = await translateText(src);
  if (translated === src && MANUAL[key]) translated = MANUAL[key];
  if (translated !== src) {
    setPath(es, key, translated);
    map[key] = translated;
  }
  done++;
  if (done % 25 === 0) {
    console.log(`  ${done}/${pending.length}`);
    fs.writeFileSync(
      path.join(messagesDir, "es.json"),
      `${JSON.stringify(es, null, 2)}\n`,
      "utf8",
    );
  }
  await sleep(800);
}

fs.writeFileSync(
  path.join(import.meta.dirname, "es-translations-map.json"),
  `${JSON.stringify(map, null, 2)}\n`,
  "utf8",
);
fs.writeFileSync(
  path.join(messagesDir, "es.json"),
  `${JSON.stringify(es, null, 2)}\n`,
  "utf8",
);
console.log("Done. Map keys:", Object.keys(map).length);
