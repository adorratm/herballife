import fs from "fs";
import path from "path";
import { translate } from "@vitalets/google-translate-api";

const source = JSON.parse(
  fs.readFileSync(
    path.join(import.meta.dirname, "legal-fallback-en-source.json"),
    "utf8",
  ),
);
const outDir = path.join(import.meta.dirname, "..", "src", "lib", "legal-fallback");

const KEEP = [
  "{{seller.name}}",
  "{{seller.address}}",
  "{{seller.email}}",
  "{{seller.phone}}",
  "{{seller.hours}}",
  "{{seller.website}}",
  "{{seller.taxOffice}}",
  "{{seller.taxNumber}}",
  "{{seller.mersis}}",
  "PayTR",
  "KVKK",
  "Herbalife",
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
  });
  return r;
}

async function tr(text, lang) {
  const { out, tokens } = protect(text);
  const res = await translate(out, { from: "en", to: lang });
  return restore(res.text, tokens);
}

for (const lang of ["de", "fr", "es"]) {
  const bundle = {};
  for (const [slug, doc] of Object.entries(source)) {
    bundle[slug] = {
      title: await tr(doc.title, lang),
      content: await tr(doc.content, lang),
    };
    console.log(lang, slug);
  }
  fs.writeFileSync(
    path.join(outDir, `${lang}.json`),
    `${JSON.stringify(bundle, null, 2)}\n`,
  );
}
