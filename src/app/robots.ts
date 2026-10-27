import type { MetadataRoute } from "next";
import { getSettings } from "@/lib/data/content";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getSettings();
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] }],
    sitemap: `${settings.siteUrl}/sitemap.xml`,
    host: settings.siteUrl,
  };
}
