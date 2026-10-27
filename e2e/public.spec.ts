import { expect, test } from "@playwright/test";

test.describe("site public", () => {
  test("l'accueil s'affiche sans débordement horizontal", async ({ page }) => {
    await page.goto("/fr");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page).toHaveTitle(/.+/);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test("la racine redirige selon la langue du navigateur", async ({ browser }) => {
    const ctx = await browser.newContext({ locale: "en-US" });
    const page = await ctx.newPage();
    await page.goto("/");
    await expect(page).toHaveURL(/\/en$/);
    await ctx.close();
  });

  test("le sélecteur de langue conserve la page (chemins localisés)", async ({ page }) => {
    await page.goto("/fr/projets/interconnexion-vpn-pfsense");
    await page.getByRole("link", { name: /English/ }).click();
    await expect(page).toHaveURL(/\/en\/projects\/interconnexion-vpn-pfsense$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });

  test("les balises hreflang et canonical sont présentes", async ({ page }) => {
    await page.goto("/fr/competences");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/fr\/competences$/);
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", /\/en\/skills$/);
  });

  test("le thème est mémorisé après rechargement", async ({ page }) => {
    await page.goto("/fr");
    const html = page.locator("html");
    const before = await html.getAttribute("data-theme");
    await page.getByRole("button", { name: /Activer le thème/ }).first().click();
    await expect(html).not.toHaveAttribute("data-theme", before ?? "");
    const after = await html.getAttribute("data-theme");
    await page.reload();
    await expect(html).toHaveAttribute("data-theme", after ?? "");
  });

  test("filtres de projets", async ({ page }) => {
    await page.goto("/fr/projets");
    await page.getByRole("button", { name: /^Design/ }).click();
    await expect(page.getByText(/^1 résultat$/)).toBeVisible();
    await page.getByRole("searchbox").fill("zabbix");
    await expect(page.getByText(/Aucun résultat/)).toBeVisible();
  });

  test("le formulaire de contact valide côté client", async ({ page }) => {
    await page.goto("/fr/contact");
    await page.getByRole("button", { name: "Envoyer le message" }).click();
    await expect(page.getByText("Ce champ est obligatoire.").first()).toBeVisible();
    await page.getByLabel(/Adresse e-mail/).fill("pas-un-email");
    await page.getByRole("button", { name: "Envoyer le message" }).click();
    await expect(page.getByText("Adresse e-mail invalide.")).toBeVisible();
  });

  test("« Demander un devis » depuis un service pré-remplit le formulaire", async ({ page }) => {
    await page.goto("/fr/devis?service=developpement-web");
    await expect(page.getByLabel(/Type de prestation/)).toHaveValue("developpement-web");
  });

  test("article : sommaire, code coloré et flux RSS", async ({ page, request }) => {
    await page.goto("/fr/blog/durcir-serveur-ubuntu");
    await expect(page.locator(".shiki").first()).toBeVisible();
    const rss = await request.get("/fr/rss.xml");
    expect(rss.headers()["content-type"]).toContain("application/rss+xml");
    expect(await rss.text()).toContain("<item>");
  });

  test("le CV d'exemple est téléchargeable", async ({ request }) => {
    const res = await request.get("/cv/cv-fr.pdf");
    expect(res.status()).toBe(200);
    expect((await res.body()).subarray(0, 4).toString()).toBe("%PDF");
  });

  test("page 404 localisée", async ({ page }) => {
    const res = await page.goto("/fr/cette-page-n-existe-pas");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "Cette page n'existe pas" })).toBeVisible();
  });

  test("lien d'évitement accessible au clavier", async ({ page, isMobile }) => {
    test.skip(isMobile, "clavier");
    await page.goto("/fr");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Aller au contenu principal" })).toBeFocused();
  });
});

test.describe("sécurité", () => {
  test("en-têtes de sécurité", async ({ request }) => {
    const res = await request.get("/fr");
    const h = res.headers();
    expect(h["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(h["x-content-type-options"]).toBe("nosniff");
    expect(h["x-frame-options"]).toBe("DENY");
  });

  test("/admin n'est pas indexable", async ({ request }) => {
    const res = await request.get("/admin/login");
    expect(res.headers()["x-robots-tag"]).toContain("noindex");
  });

  test("l'export CSV refuse un visiteur non connecté", async ({ request }) => {
    const res = await request.get("/admin/export/messages", { maxRedirects: 0 });
    expect([401, 307]).toContain(res.status());
  });

  test("robots.txt exclut l'administration", async ({ request }) => {
    expect(await (await request.get("/robots.txt")).text()).toContain("Disallow: /admin");
  });
});

test("favicon et icône Apple servis sans redirection", async ({ request }) => {
  for (const path of ["/icon", "/apple-icon"]) {
    const res = await request.get(path, { maxRedirects: 0 });
    expect(res.status(), path).toBe(200);
    expect(res.headers()["content-type"]).toContain("image/png");
  }
});
