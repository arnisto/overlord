import { expect, type Page } from "@playwright/test";

export const DEMO_PASSWORD = process.env.DEMO_USER_PASSWORD ?? "Demo1234!";

export async function loginAs(page: Page, username: string, next = "/") {
  await page.goto(`/connexion?next=${encodeURIComponent(next)}`);
  await page.getByLabel("Pseudo ou e-mail").fill(username);
  await page.getByLabel("Mot de passe").fill(DEMO_PASSWORD);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page.getByRole("button", { name: "Déconnexion" })).toBeVisible();
}

export const uniqueTitle = (label: string) => `${label} ${Date.now()}`;
