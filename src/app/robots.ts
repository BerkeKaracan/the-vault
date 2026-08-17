import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/desk",
        "/library",
        "/log",
        "/stats",
        "/settings",
        "/discover",
        "/materials",
        "/vault",
        "/add",
        "/api",
      ],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
