import { expect, test } from "@playwright/test";
import { openClients, signIn } from "./helpers";

test("open a client, add a note and move it down the pipeline", async ({ page }) => {
  await openClients(page);
  await page.getByRole("link", { name: "Olivia Bennett" }).click();
  await expect(page.getByRole("heading", { name: "Olivia Bennett", level: 1 })).toBeVisible();

  await page.getByLabel("New note").fill("Demo booked for Friday");
  await page.getByRole("button", { name: "Add note" }).click();
  await expect(page.getByRole("list", { name: "Notes" }).getByText("Demo booked for Friday")).toBeVisible();

  await page.getByRole("radio", { name: "Active" }).click();
  await expect(
    page.getByRole("list", { name: "Client activity" }).getByText("Moved from Lead to Active"),
  ).toBeVisible();
});

test("a deep link works after a reload and unknown clients get a clear message", async ({ page }) => {
  await signIn(page, "/clients/CL-003");
  await expect(page.getByRole("heading", { name: "Aziz Karimov", level: 1 })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Aziz Karimov", level: 1 })).toBeVisible();

  await page.goto("/clients/CL-999");
  await expect(page.getByText("Client not found")).toBeVisible();
});

test("the demo settings show the error state and recover", async ({ page }) => {
  await signIn(page, "/settings");
  await page.getByRole("switch", { name: "Server error (500)" }).click();
  await page.getByRole("button", { name: "Reload all data" }).click();
  await page.goto("/clients");
  await expect(page.getByText("Couldn't load clients")).toBeVisible();

  await page.goto("/settings");
  await page.getByRole("switch", { name: "Server error (500)" }).click();
  await page.goto("/clients");
  await expect(page.getByText("50 clients in your pipeline")).toBeVisible();
});
