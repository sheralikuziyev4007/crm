import { expect, type Page } from "@playwright/test";

/** Signs in with the pre-filled demo account and waits for the dashboard. */
export async function signIn(page: Page, path = "/") {
  await page.goto(path);
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
  await page.getByRole("button", { name: "Sign in" }).click();
}

export async function openClients(page: Page) {
  await signIn(page, "/clients");
  await expect(page.getByRole("heading", { name: "Clients", level: 1 })).toBeVisible();
  await expect(page.getByText("50 clients in your pipeline")).toBeVisible();
}
