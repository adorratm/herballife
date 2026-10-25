/**
 * Apply Spanish translations to messages/es.json (offline map + EN dictionary).
 */
import fs from "fs";
import path from "path";

const root = path.join(import.meta.dirname, "..", "messages");
const enPath = path.join(root, "en.json");
const esPath = path.join(root, "es.json");

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

/** @type {Record<string, string>} */
const TRANSLATIONS = {
  "common.genericError": "Se ha producido un error",
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
  "cart.subtotal": "Subtotal del pedido",
  "cart.viewCart": "Ver carrito",
  "home.fallbackFaqTitle": "Preguntas frecuentes",
  "home.productCount": "{count} productos",
  "home.productsComingSoon": "Productos próximamente.",
  "home.categoryHub.kilo-kontrolu.name": "Control de peso",
  "home.categoryHub.kilo-kontrolu.blurb": "Productos Fórmula y de programa",
  "home.categoryHub.icecekler.name": "Bebidas",
  "home.categoryHub.icecekler.blurb": "Bebidas de aloe, té y fibra",
  "home.categoryHub.avantajli-setler.name": "Packs con regalo",
  "home.categoryHub.avantajli-setler.blurb": "Paquetes con shaker de regalo",
  "home.categoryHub.takviye-edici.name": "Suplementos",
  "home.categoryHub.takviye-edici.blurb": "Vitaminas y minerales",
  "home.categoryHub.sporcu-urunleri.name": "Nutrición deportiva",
  "home.categoryHub.sporcu-urunleri.blurb": "Proteína y rendimiento",
  "home.categoryHub.atistirmalik.name": "Snacks",
  "home.categoryHub.atistirmalik.blurb": "Barritas proteicas y snacks",
  "checkout.stepCart": "Carrito",
  "checkout.stepDelivery": "Entrega",
  "checkout.stepPayment": "Pago seguro",
  "checkout.preparing": "Preparando el pago…",
  "checkout.emptyCart": "Tu carrito está vacío.",
  "checkout.backToShop": "Volver a la tienda",
  "checkout.breadcrumbDelivery": "Entrega",
  "checkout.titleDeliveryPayment": "Entrega y pago",
  "checkout.savedAddressHint": "Elige una dirección guardada o añade una nueva.",
  "checkout.loginForAddressBook": "Para tu libreta de direcciones,",
  "checkout.signInLink": "inicia sesión",
  "checkout.contactHeading": "Contacto",
  "checkout.collapse": "Contraer",
  "checkout.edit": "Editar",
  "checkout.deliveryMethodHeading": "Método de entrega",
  "checkout.errLegalRequired": "Debes aceptar las confirmaciones legales.",
  "checkout.labelDelivery": "Entrega",
  "checkout.labelShipping": "Envío",
  "checkout.shipByCargo": "Envío por mensajería",
  "checkout.pickupAtStore": "Recogida en tienda",
  "checkout.shippingProviderHeading": "Transportista",
  "home.fallbackFaqItems[0].question": "¿Los productos son originales?",
  "home.fallbackFaqItems[0].answer":
    "Sí. Los productos vendidos son originales de Herbalife Nutrition. Este sitio pertenece a un distribuidor independiente; no es el sitio oficial de Herbalife.",
  "home.fallbackFaqItems[1].question": "¿Cuánto tarda el envío?",
  "home.fallbackFaqItems[1].answer":
    "Tras confirmar el pago, los pedidos suelen enviarse en 1–3 días laborables. Compartimos el código de seguimiento en tu notificación.",
  "home.fallbackFaqItems[2].question": "¿Cómo puedo pagar?",
  "home.fallbackFaqItems[2].answer":
    "Los pagos con tarjeta usan la infraestructura segura PayTR. No hay contra reembolso. Aplica cupones en el pago si tienes uno.",
  "home.fallbackFaqItems[3].question": "¿Tengo derecho de desistimiento?",
  "home.fallbackFaqItems[3].answer":
    "Las ventas a distancia incluyen 14 días de desistimiento. Ver Cancelación y devoluciones; solicítalo con tu n.º de pedido.",
  "home.fallbackFaqItems[4].question": "¿Qué es el seguimiento nutricional?",
  "home.fallbackFaqItems[4].answer":
    "Registra agua, comidas y mediciones en tu cuenta; tu coach puede aprobarlas y apoyarte.",
  "home.fallbackFaqItems[5].question": "¿Qué pack debo elegir?",
  "home.fallbackFaqItems[5].answer":
    "Ofrecemos packs con regalo según tu objetivo. Asesoría de productos por WhatsApp — respuesta habitual en menos de una hora.",
  "home.categoryHub.atistirmalik.name": "Aperitivos",
  "checkout.vatIncluded": " incluido",
  "blog.readMinutes": "{minutes} min de lectura",
  "siteSearch.sectionLegal": "Información legal",
  "authPassword.sending": "Enviando…",
  "authPassword.saving": "Guardando…",
  "reviewsPage.googleBusiness": "Perfil Google Business",
  "footer.legal": "Información legal",
  "contactPage.subjectGeneral": "Consulta general",
  "legalSeo.keywords": "normativa",
  "cookies.marketing": "Publicidad (Google Ads / Meta)",
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
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (c[p] === undefined) c[p] = typeof parts[i + 1] === "number" ? [] : {};
    c = c[p];
  }
  c[parts[parts.length - 1]] = value;
}

function flatWithArrays(o, p = "") {
  const r = {};
  for (const k of Object.keys(o)) {
    const key = p ? `${p}.${k}` : k;
    const v = o[k];
    if (Array.isArray(v)) {
      v.forEach((item, i) => {
        if (item && typeof item === "object") {
          Object.assign(r, flatWithArrays(item, `${key}[${i}]`));
        } else {
          r[`${key}[${i}]`] = item;
        }
      });
    } else if (v && typeof v === "object") {
      Object.assign(r, flatWithArrays(v, key));
    } else {
      r[key] = v;
    }
  }
  return r;
}

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

function loadJson(name) {
  const p = path.join(import.meta.dirname, name);
  if (!fs.existsSync(p)) return {};
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

/** @type {Record<string, string>} */
const pathMap = {};
for (const f of fs.readdirSync(import.meta.dirname).filter((n) => /^es-chunk-\d+\.json$/.test(n))) {
  Object.assign(pathMap, loadJson(f));
}
Object.assign(pathMap, loadJson("es-path-map.json"));

const enToEs = loadJson("es-en-remaining.json");
const byEn = loadJson("es-missing-by-en.json");

for (const [enText, { paths }] of Object.entries(byEn)) {
  const esText = enToEs[enText];
  if (!esText) continue;
  for (const p of paths) pathMap[p] = esText;
}

Object.assign(pathMap, TRANSLATIONS);

const batch = loadJson("i18n-batch.json");
let es = JSON.parse(fs.readFileSync(esPath, "utf8"));
if (batch.es) deepMerge(es, batch.es);

for (const [dotPath, value] of Object.entries(pathMap)) {
  setPath(es, dotPath, value);
}

fs.writeFileSync(esPath, `${JSON.stringify(es, null, 2)}\n`, "utf8");

const en = JSON.parse(fs.readFileSync(enPath, "utf8"));
const fe = flatWithArrays(en);
const fes = flatWithArrays(es);
let identical = 0;
let total = 0;
for (const k of Object.keys(fe)) {
  if (typeof fe[k] !== "string") continue;
  total++;
  if (fes[k] === fe[k] && !EXACT_OK.has(fe[k])) identical++;
}
console.log("Applied paths:", Object.keys(pathMap).length);
console.log("identical (excl. brands):", identical, "total strings:", total);

const missingEn = Object.keys(byEn).filter((enText) => !enToEs[enText]);
if (missingEn.length) {
  console.warn("Missing EN dict entries:", missingEn.length);
}
