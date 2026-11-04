import { expect, test } from "@playwright/test";
import { signIn } from "./helpers";

test("protected pages redirect to login, and sign-in returns you there", async ({ page }) => {
  await page.goto("/clients");
  await expect(page).toHaveURL(/\/login$/);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/clients$/);
  await expect(page.getByRole("heading", { name: "Clients", level: 1 })).toBeVisible();
});

test("wrong password shows an error", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Password", { exact: true }).fill("not-the-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByText("Invalid email or password.")).toBeVisible();
});

test("the session survives a reload and ends with log out", async ({ page }) => {
  await signIn(page);
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();

  await page.getByRole("button", { name: "Alex Morgan" }).click();
  await page.getByRole("menuitem", { name: "Log out" }).click();
  await expect(page.getByText("You have been signed out.")).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
});
