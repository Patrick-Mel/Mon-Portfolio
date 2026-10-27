import { getSettings } from "@/lib/data/content";
import { tr } from "@/lib/i18n-utils";
import { OG_SIZE, renderOg } from "@/lib/og";
import type { Locale } from "@/lib/types";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Open Graph";

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const locale = ((await params).locale === "en" ? "en" : "fr") as Locale;
  const settings = await getSettings();
  return renderOg({
    settings,
    eyebrow: settings.ownerName,
    title: tr(settings.tagline, locale),
    subtitle: tr(settings.role, locale),
  });
}
