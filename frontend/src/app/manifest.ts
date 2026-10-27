import type { MetadataRoute } from "next";
import { DEFAULT_SETTINGS } from "@/lib/cms";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: DEFAULT_SETTINGS.brand.name,
    short_name: "Herbal Kapıda",
    description: DEFAULT_SETTINGS.seo.description,
    start_url: "/",
    display: "standalone",
    background_color: "#131313",
    theme_color: "#131313",
    lang: "tr",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "16x16 32x32 48x48",
        type: "image/x-icon",
        purpose: "any",
      },
      {
        src: "/icon.png",
        sizes: "64x64",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
