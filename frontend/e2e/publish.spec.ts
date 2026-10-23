import { expect, test } from "@playwright/test";
import { loginAs, uniqueTitle } from "./helpers";

test.describe("Publication (membre connecté)", () => {
  test("crée une discussion, est redirigé vers elle puis y répond", async ({ page }) => {
    await loginAs(page, "Thomas_PEA", "/discussions/nouvelle");
    await expect(page).toHaveURL(/\/discussions\/nouvelle$/);

    // Les règles de validation s'affichent sans quitter la page.
    await page.getByLabel("Titre").fill("Court");
    await page.getByRole("button", { name: "Publier", exact: true }).click();
    await expect(page.getByText(/au moins 10 caractères/)).toBeVisible();

    const title = uniqueTitle("Livret A ou fonds euros pour l'épargne de précaution");
    await page.getByLabel("Titre").fill(title);
    await page.getByText("Discussion", { exact: true }).click();
    await page.getByLabel("Catégorie").selectOption({ label: "Épargne & placements" });
    await page.getByLabel("Contenu").fill("J'ai six mois de dépenses de côté. Comment les répartir ?");
    await page.getByRole("button", { name: "Publier", exact: true }).click();

    await expect(page).toHaveURL(/\/discussions\/livret-a-ou-fonds-euros/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(title);
    await expect(page.getByText("Aucune réponse pour l'instant")).toBeVisible();

    await page.getByLabel("Votre réponse").fill("Je garde tout sur le Livret A pour la disponibilité.");
    await page.getByRole("button", { name: "Publier ma réponse" }).click();
    await expect(page.getByRole("heading", { name: "1 réponse" })).toBeVisible();
    await expect(page.getByText("Je garde tout sur le Livret A pour la disponibilité.")).toBeVisible();

    // La nouvelle discussion apparaît en tête de l'accueil (tri par date décroissante).
    await page.goto("/");
    await expect(page.locator("article").first()).toContainText(title);
  });

  test("ajoute puis retire un vote « Utile »", async ({ page }) => {
    await loginAs(page, "Odile.Retraite", "/discussions/ouvrir-un-pea-avec-5-000-par-ou-commencer");

    const vote = page.getByRole("button", { name: /Utile/ }).first();
    const count = async () => Number((await vote.textContent())?.match(/\d+/)?.[0]);
    const initiallyVoted = (await vote.getAttribute("aria-pressed")) === "true";
    const initialCount = await count();

    await vote.click();
    await expect(vote).toHaveAttribute("aria-pressed", String(!initiallyVoted));
    await expect(vote).toContainText(String(initialCount + (initiallyVoted ? -1 : 1)));

    // Second clic : retour à l'état initial, confirmé par Strapi après rechargement.
    await vote.click();
    await expect(vote).toHaveAttribute("aria-pressed", String(initiallyVoted));
    await page.reload();
    await expect(page.getByRole("button", { name: /Utile/ }).first()).toContainText(String(initialCount));
  });
});
