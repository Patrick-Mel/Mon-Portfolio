import { describe, expect, it } from "vitest";
import { parseFields, type FieldDef } from "@/lib/admin/fields";
import { contactSchema, fieldErrorsOf, quoteSchema, validateAttachments } from "@/lib/validation/forms";

const validContact = { name: "Awa Ngono", email: "awa@example.com", subject: "Stage", message: "Bonjour, je souhaite échanger avec vous." };

describe("formulaire de contact", () => {
  it("accepte une soumission valide et applique les valeurs par défaut", () => {
    const r = contactSchema.safeParse(validContact);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.locale).toBe("fr");
  });

  it("renvoie des codes d'erreur traduisibles", () => {
    const r = contactSchema.safeParse({ ...validContact, email: "pas-un-email", message: "court" });
    expect(r.success).toBe(false);
    if (!r.success) {
      const e = fieldErrorsOf(r.error);
      expect(e.email).toBe("email");
      expect(e.message).toBe("tooShort:10");
    }
  });

  it("rejette un pot de miel rempli", () => {
    expect(contactSchema.safeParse({ ...validContact, website: "http://spam" }).success).toBe(false);
  });

  it("supprime les espaces superflus", () => {
    const r = contactSchema.safeParse({ ...validContact, name: "  Awa  " });
    expect(r.success && r.data.name).toBe("Awa");
  });
});

describe("formulaire de devis", () => {
  const valid = { ...validContact, service: "developpement-web", description: "Un site vitrine bilingue pour notre PME.", budget: "lt150k", timeline: "flexible" };

  it("accepte un devis valide", () => {
    expect(quoteSchema.safeParse(valid).success).toBe(true);
  });

  it("refuse un budget hors liste et un téléphone invalide", () => {
    expect(quoteSchema.safeParse({ ...valid, budget: "1M" }).success).toBe(false);
    expect(quoteSchema.safeParse({ ...valid, phone: "<script>" }).success).toBe(false);
  });

  it("contrôle les pièces jointes", () => {
    expect(validateAttachments([{ size: 1000, type: "application/pdf" }])).toBeNull();
    expect(validateAttachments([{ size: 6 * 1024 * 1024, type: "application/pdf" }])).toBe("fileTooLarge");
    expect(validateAttachments([{ size: 10, type: "application/x-msdownload" }])).toBe("fileType");
    expect(validateAttachments(Array(4).fill({ size: 10, type: "image/png" }))).toBe("tooManyFiles");
  });
});

describe("parseur des formulaires d'administration", () => {
  const fields: FieldDef[] = [
    { name: "title", type: "i18n", label: "Titre", required: true },
    { name: "slug", type: "slug", label: "Slug", required: true },
    { name: "featured", type: "boolean", label: "En avant" },
    { name: "stack", type: "list", label: "Stack" },
    { name: "socials.github", type: "url", label: "GitHub" },
    { name: "seo", type: "i18n-textarea", label: "SEO" },
    { name: "accent", type: "color", label: "Accent" },
  ];
  const fd = (entries: Record<string, string>) => {
    const f = new FormData();
    Object.entries(entries).forEach(([k, v]) => f.append(k, v));
    return f;
  };

  it("construit la ligne (chemins imbriqués, listes, booléens, null)", () => {
    const r = parseFields(fields, fd({ "title.fr": "Projet", "title.en": "Project", slug: "mon-projet", featured: "on", stack: "Linux, Docker\nNginx", "socials.github": "https://github.com/x", accent: "#FF5A1F" }));
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.values).toMatchObject({ title: { fr: "Projet", en: "Project" }, featured: true, stack: ["Linux", "Docker", "Nginx"], socials: { github: "https://github.com/x" }, seo: null });
    }
  });

  it("signale traductions manquantes, slug et URL invalides", () => {
    const r = parseFields(fields, fd({ "title.fr": "Projet", slug: "Mon Projet", "socials.github": "javascript:alert(1)", accent: "red" }));
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(Object.keys(r.errors).sort()).toEqual(["accent", "slug", "socials.github", "title"]);
    }
  });
});
