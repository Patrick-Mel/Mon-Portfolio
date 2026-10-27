import { describe, expect, it } from "vitest";
import { toCsv } from "@/lib/csv";
import { fillTemplate, readingTime, slugify, tr } from "@/lib/i18n-utils";
import { renderMarkdown } from "@/lib/markdown";
import { educationSummary } from "@/lib/timeline";
import { escapeXml } from "@/lib/xml";
import { timeline } from "@/content/profile";
import { siteConfig } from "@/site.config";

describe("utilitaires", () => {
  it("slugify retire accents et ponctuation", () => {
    expect(slugify("Réseaux & Sécurité : l'essentiel !")).toBe("reseaux-securite-l-essentiel");
  });

  it("tr gère texte simple, traduction et repli", () => {
    expect(tr("pfSense", "en")).toBe("pfSense");
    expect(tr({ fr: "Bonjour", en: "Hello" }, "en")).toBe("Hello");
    expect(tr({ fr: "Bonjour", en: "" }, "en")).toBe("Bonjour");
  });

  it("temps de lecture minimal d'une minute", () => {
    expect(readingTime("deux mots")).toBe(1);
    expect(readingTime(Array(600).fill("mot").join(" "))).toBe(3);
  });

  it("remplit les variables des pages légales sans nom codé en dur", () => {
    const out = fillTemplate("{{ownerName}} — {{contactEmail}} — {{inconnu}}", siteConfig, "fr");
    expect(out).toBe(`${siteConfig.ownerName} — ${siteConfig.contactEmail} — {{inconnu}}`);
  });

  it("résume la formation depuis le parcours", () => {
    expect(educationSummary(timeline)).toBe("IAI Cameroun · 2023 — 2026");
  });

  it("CSV : guillemets échappés et injection de formules neutralisée", () => {
    const csv = toCsv([{ a: '=HYPERLINK("x")', b: 'dit "bonjour"' }], [{ key: "a", label: "A" }, { key: "b", label: "B" }]);
    expect(csv).toContain(`"'=HYPERLINK(""x"")"`);
    expect(csv).toContain(`"dit ""bonjour"""`);
  });

  it("XML échappé", () => {
    expect(escapeXml(`<a href="x">Tom & Jerry's</a>`)).toBe("&lt;a href=&quot;x&quot;&gt;Tom &amp; Jerry&apos;s&lt;/a&gt;");
  });
});

describe("Markdown", () => {
  it("supprime le HTML et les liens javascript:", async () => {
    const { html } = await renderMarkdown('<script>alert(1)</script>\n\n[x](javascript:alert(1)) <img src=x onerror=alert(1)>');
    expect(html).not.toContain("<script");
    expect(html).not.toContain("javascript:");
    expect(html).not.toContain("onerror");
  });

  it("génère le sommaire et les ancres", async () => {
    const { html, toc } = await renderMarkdown("## Phase 1\n\ntexte\n\n### Détail\n\n## Phase 2");
    expect(toc.map((t) => t.id)).toEqual(["phase-1", "détail", "phase-2"]);
    expect(html).toContain('id="phase-1"');
  });

  it("colore le code pour les deux thèmes", async () => {
    const { html } = await renderMarkdown("```bash\nsudo ufw enable\n```");
    expect(html).toContain("--shiki-dark");
  });

  it("ouvre les liens externes en sécurité", async () => {
    const { html } = await renderMarkdown("[site](https://example.com)");
    expect(html).toContain('rel="noopener noreferrer"');
  });
});
