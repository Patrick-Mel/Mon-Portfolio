import { ImageResponse } from "next/og";
import type { SiteSettings } from "@/lib/types";

export const OG_SIZE = { width: 1200, height: 630 };

/** Monogramme pour Satori (flexbox uniquement, pas de SVG <text>). */
function Mark({ settings, size }: { settings: SiteSettings; size: number }) {
  const s = size / 48;
  return (
    <div style={{ position: "relative", width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <svg width={size} height={size} viewBox="0 0 48 48" style={{ position: "absolute", top: 0, left: 0 }}>
        <path d="M11 2.5H45.5V37L37 45.5H2.5V11Z" fill="none" stroke="#f2f0ea" strokeWidth="2.5" />
        <path d="M37 45.5L45.5 37" stroke={settings.accentColor} strokeWidth="2.5" />
        <rect x="41.5" y="41.5" width="6" height="6" fill={settings.accentColor} />
      </svg>
      <span style={{ fontSize: 17 * s, fontWeight: 700, color: "#f2f0ea", letterSpacing: -0.6 * s }}>{settings.initials}</span>
    </div>
  );
}

/** Image de partage aux couleurs « Signal » : fond encre, grille de points, liaison orange. */
export function renderOg({
  settings,
  eyebrow,
  title,
  subtitle,
}: {
  settings: SiteSettings;
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#0e0e0c",
          backgroundImage: "radial-gradient(rgba(242,240,234,0.12) 1.5px, transparent 1.5px)",
          backgroundSize: "28px 28px",
          color: "#f2f0ea",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <Mark settings={settings} size={64} />
          <span style={{ fontSize: 28, fontWeight: 600 }}>{settings.brandName}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 1000 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 22, color: "#b3b0a6", textTransform: "uppercase", letterSpacing: 3 }}>
            <div style={{ width: 48, height: 3, background: settings.accentColor }} />
            {eyebrow}
          </div>
          <div style={{ fontSize: title.length > 60 ? 56 : 68, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2 }}>{title}</div>
          {subtitle && <div style={{ fontSize: 26, color: "#b3b0a6", lineHeight: 1.4 }}>{subtitle}</div>}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 22, color: "#8d8a81" }}>
          <span>{settings.siteUrl.replace(/^https?:\/\//, "")}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 160, height: 2, background: "#3d3c36" }} />
            <div style={{ width: 14, height: 14, background: settings.accentColor }} />
          </div>
        </div>
      </div>
    ),
    OG_SIZE,
  );
}

/** Favicon / icône d'application. */
export function renderIcon(settings: SiteSettings, size: number) {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0e0e0c" }}>
        <Mark settings={settings} size={Math.round(size * 0.8)} />
      </div>
    ),
    { width: size, height: size },
  );
}
