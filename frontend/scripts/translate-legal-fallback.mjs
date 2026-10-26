import fs from "fs";
import path from "path";

const source = JSON.parse(
  fs.readFileSync(
    path.join(import.meta.dirname, "legal-fallback-en-source.json"),
    "utf8",
  ),
);
const outDir = path.join(import.meta.dirname, "..", "src", "lib", "legal-fallback");
fs.mkdirSync(outDir, { recursive: true });

const KEEP = [
  "PayTR",
  "KVKK",
  "Herbal Kapıda",
  "MERSİS",
  "SSL",
  "3D Secure",
  "{{seller.name}}",
  "{{seller.address}}",
  "{{seller.email}}",
  "{{seller.phone}}",
  "{{seller.hours}}",
  "{{seller.website}}",
  "{{seller.taxOffice}}",
  "{{seller.taxNumber}}",
  "{{seller.mersis}}",
];

function protect(text) {
  const tokens = [];
  let out = text;
  for (const term of KEEP) {
    const re = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g");
    out = out.replace(re, () => {
      const id = tokens.length;
      tokens.push(term);
      return `__T${id}__`;
    });
  }
  return { out, tokens };
}

function restore(text, tokens) {
  let r = text;
  tokens.forEach((t, i) => {
    r = r.replaceAll(`__T${i}__`, t);
    r = r.replaceAll(`__t${i}__`, t);
  });
  return r;
}

async function translate(text, lang) {
  const chunks = text.length > 480 ? [text.slice(0, 480), text.slice(480)] : [text];
  const parts = [];
  for (const chunk of chunks) {
    const { out, tokens } = protect(chunk);
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(out)}&langpair=en|${lang}`;
    const res = await fetch(url);
    const data = await res.json();
    parts.push(restore(data.responseData?.translatedText || chunk, tokens));
    await new Promise((r) => setTimeout(r, 350));
  }
  return parts.join("");
}

for (const lang of ["de", "fr", "es"]) {
  const bundle = {};
  for (const [slug, doc] of Object.entries(source)) {
    bundle[slug] = {
      title: await translate(doc.title, lang),
      content: await translate(doc.content, lang),
    };
    console.log(lang, slug);
  }
  fs.writeFileSync(
    path.join(outDir, `${lang}.json`),
    `${JSON.stringify(bundle, null, 2)}\n`,
  );
}
