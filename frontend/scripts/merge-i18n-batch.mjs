import fs from "fs";
import path from "path";

const root = path.join(import.meta.dirname, "..", "messages");

function deepMerge(target, source) {
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
      deepMerge(target[key], sv);
    } else {
      target[key] = sv;
    }
  }
  return target;
}

const batch = JSON.parse(
  fs.readFileSync(path.join(import.meta.dirname, "i18n-batch.json"), "utf8"),
);

for (const locale of ["tr", "en", "de", "fr", "es"]) {
  const file = path.join(root, `${locale}.json`);
  const data = JSON.parse(fs.readFileSync(file, "utf8"));
  deepMerge(data, batch[locale]);
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  console.log("merged", locale);
}
