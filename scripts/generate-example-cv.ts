/**
 * Génère public/cv/cv-fr.pdf et cv-en.pdf : des CV D'EXEMPLE construits à partir
 * du contenu d'exemple, pour que le bouton « Télécharger mon CV » fonctionne dès
 * le premier lancement. À remplacer par vos vrais PDF depuis /admin → Paramètres.
 *
 * Usage : pnpm tsx scripts/generate-example-cv.ts
 * PDF minimal écrit à la main (Helvetica, encodage WinAnsi) : aucune dépendance.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { projects } from "../src/content/projects";
import { skills, timeline } from "../src/content/profile";
import { siteConfig } from "../site.config";
import type { Locale } from "../src/lib/types";

const L = {
  fr: {
    banner: "CV D'EXEMPLE — à remplacer depuis /admin › Paramètres",
    education: "FORMATION",
    experience: "EXPÉRIENCE",
    skills: "COMPÉTENCES",
    projects: "PROJETS",
    present: "aujourd'hui",
    cats: { network: "Réseaux", systems: "Systèmes & sécurité", fullstack: "Full-stack", design: "Design" },
  },
  en: {
    banner: "EXAMPLE RESUME — replace it from /admin › Settings",
    education: "EDUCATION",
    experience: "EXPERIENCE",
    skills: "SKILLS",
    projects: "PROJECTS",
    present: "present",
    cats: { network: "Networking", systems: "Systems & security", fullstack: "Full-stack", design: "Design" },
  },
} as const;

/** Texte → octets WinAnsi (les caractères hors latin-1 sont simplifiés). */
function pdfString(s: string): string {
  const simplified = s
    .replace(/[‘’]/g, "'")
    .replace(/[“”«»]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/·/g, "-")
    .replace(/›/g, ">")
    .replace(/…/g, "...")
    .replace(/[^\x20-\xff]/g, "");
  return `(${simplified.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)")})`;
}

function wrap(text: string, max: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    if ((line + " " + w).trim().length > max) {
      lines.push(line.trim());
      line = w;
    } else line += " " + w;
  }
  if (line.trim()) lines.push(line.trim());
  return lines;
}

function buildPdf(locale: Locale): Buffer {
  const t = L[locale];
  const ops: string[] = [];
  let y = 800;
  const text = (s: string, x: number, size: number, bold = false, color = "0.07 0.07 0.06") => {
    ops.push(`BT ${color} rg /${bold ? "F2" : "F1"} ${size} Tf ${x} ${y} Td ${pdfString(s)} Tj ET`);
  };
  const line = (gap: number) => (y -= gap);

  // Bandeau d'exemple
  ops.push("1 0.353 0.122 rg 0 822 595 20 re f");
  y = 829;
  text(t.banner, 40, 9, true, "0.08 0.04 0.02");
  y = 780;
  text(siteConfig.ownerName, 40, 24, true);
  line(22);
  for (const l of wrap(siteConfig.role[locale], 90)) {
    text(l, 40, 10.5, false, "0.31 0.30 0.28");
    line(14);
  }
  text(`${siteConfig.contactEmail}  -  ${siteConfig.phone}  -  ${siteConfig.location[locale]}`, 40, 9.5, false, "0.42 0.41 0.38");
  line(26);
  ops.push(`1 0.353 0.122 RG 1.5 w 40 ${y + 10} m 555 ${y + 10} l S`);

  const section = (title: string) => {
    line(8);
    text(title, 40, 10, true, "0.70 0.25 0.06");
    line(16);
  };

  for (const kind of ["education", "experience"] as const) {
    const entries = timeline.filter((e) => e.kind === kind);
    if (!entries.length) continue;
    section(t[kind]);
    for (const e of entries) {
      text(`${e.startDate} - ${e.endDate ?? t.present}`, 40, 9, false, "0.42 0.41 0.38");
      const titleLines = wrap(e.title[locale], 70);
      titleLines.forEach((tl, i) => {
        text(tl, 150, 10.5, true);
        if (i < titleLines.length - 1) line(13);
      });
      line(13);
      text(`${e.organization}, ${e.location}`, 150, 9.5, false, "0.31 0.30 0.28");
      line(13);
      for (const d of wrap(e.description[locale], 85)) {
        text(d, 150, 9, false, "0.31 0.30 0.28");
        line(12);
      }
      line(6);
    }
  }

  section(t.skills);
  for (const cat of ["network", "systems", "fullstack", "design"] as const) {
    const names = skills.filter((s) => s.category === cat).map((s) => s.name[locale]);
    const lines = wrap(names.join(", "), 85);
    text(t.cats[cat], 40, 9.5, true);
    lines.forEach((l) => {
      text(l, 150, 9, false, "0.31 0.30 0.28");
      line(12);
    });
    line(4);
  }

  section(t.projects);
  for (const p of projects) {
    text(String(p.year), 40, 9, false, "0.42 0.41 0.38");
    text(p.title[locale].slice(0, 80), 150, 10, true);
    line(13);
    text(p.stack.join(", ").slice(0, 95), 150, 8.5, false, "0.42 0.41 0.38");
    line(16);
  }

  const stream = ops.join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>",
    `<< /Length ${Buffer.byteLength(stream, "latin1")} >>\nstream\n${stream}\nendstream`,
    `<< /Title ${pdfString(`CV - ${siteConfig.ownerName}`)} /Producer (generate-example-cv) >>`,
  ];

  let out = "%PDF-1.4\n%\xe2\xe3\xcf\xd3\n";
  const offsets: number[] = [];
  objects.forEach((o, i) => {
    offsets.push(Buffer.byteLength(out, "latin1"));
    out += `${i + 1} 0 obj\n${o}\nendobj\n`;
  });
  const xref = Buffer.byteLength(out, "latin1");
  out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  out += offsets.map((o) => `${String(o).padStart(10, "0")} 00000 n \n`).join("");
  out += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info ${objects.length} 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(out, "latin1");
}

const dir = join(process.cwd(), "public", "cv");
mkdirSync(dir, { recursive: true });
for (const locale of ["fr", "en"] as const) {
  writeFileSync(join(dir, `cv-${locale}.pdf`), buildPdf(locale));
  console.log(`✓ public/cv/cv-${locale}.pdf`);
}
