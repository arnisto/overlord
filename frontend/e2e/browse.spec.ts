import { expect, test } from "@playwright/test";

test.describe("Lecture (visiteur)", () => {
  test("l'accueil affiche les discussions issues de Strapi et filtre par catégorie", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "La communauté des lecteurs du Revenu" })).toBeVisible();

    const cards = page.locator("article");
    await expect(cards.first()).toBeVisible();
    expect(await cards.count()).toBeGreaterThan(1);

    await page.getByRole("navigation", { name: "Espaces" }).getByRole("link", { name: "Immobilier & SCPI" }).first().click();
    await expect(page).toHaveURL(/category=immobilier/);
    await expect(page.getByRole("heading", { level: 1, name: "Immobilier & SCPI" })).toBeVisible();
    // Chaque carte affichée appartient à la catégorie choisie.
    const filtered = page.locator("article");
    await expect(filtered.first()).toBeVisible();
    await expect(filtered.getByRole("link", { name: "Immobilier & SCPI" })).toHaveCount(await filtered.count());
  });

  test("ouvre le détail d'une discussion avec ses réponses", async ({ page }) => {
    await page.goto("/?q=PEA");
    await page.getByRole("link", { name: "Ouvrir un PEA avec 5 000 € : par où commencer ?" }).click();

    await expect(page).toHaveURL(/\/discussions\/ouvrir-un-pea-avec-5-000-par-ou-commencer$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Ouvrir un PEA avec 5 000 € : par où commencer ?");
    await expect(page.getByRole("heading", { name: /réponses/ })).toBeVisible();
    await expect(page.getByRole("link", { name: "Se connecter pour répondre" })).toBeVisible();
  });

  test("redirige un visiteur vers la connexion avant de publier", async ({ page }) => {
    await page.goto("/discussions/nouvelle");
    await expect(page).toHaveURL(/\/connexion\?next=/);
    await expect(page.getByRole("heading", { name: "Se connecter" })).toBeVisible();
  });

  test("affiche une page 404 pour une discussion inconnue", async ({ page }) => {
    await page.goto("/discussions/discussion-qui-n-existe-pas");
    await expect(page.getByRole("heading", { name: "Page introuvable" })).toBeVisible();
  });
});
