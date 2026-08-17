import type { MetadataRoute } from "next";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const [dictionary, locale] = await Promise.all([
    getDictionary(),
    getLocale(),
  ]);

  return {
    name: dictionary.brand,
    short_name: dictionary.brand,
    description: dictionary.meta.description,
    start_url: "/",
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#09090b",
    lang: locale,
    icons: [
      {
        src: "/icon",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
