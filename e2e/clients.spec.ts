import { expect, test } from "@playwright/test";
import { openClients } from "./helpers";

// The core flow a client would test by hand: add → edit → delete, on desktop and on a phone.
test("add, edit and delete a client", async ({ page }) => {
  await openClients(page);

  // Add
  await page.getByRole("button", { name: "Add client" }).click();
  const addDialog = page.getByRole("dialog", { name: "New client" });
  await addDialog.getByLabel(/^Name/).fill("Jane Cooper");
  await addDialog.getByLabel(/^Company/).fill("Acme Inc.");
  await addDialog.getByLabel(/^Email/).fill("jane@acme.com");
  await addDialog.getByLabel(/^Phone/).fill("+1 415 555 0177");
  await addDialog.getByRole("button", { name: "Add client" }).click();
  await expect(addDialog).toBeHidden();
  await expect(page.getByText("51 clients in your pipeline")).toBeVisible();

  await page.getByLabel("Search clients").fill("jane@acme");
  await expect(page.getByRole("link", { name: "Jane Cooper" })).toBeVisible();

  // Edit
  await page.getByRole("button", { name: "Edit Jane Cooper" }).click();
  const editDialog = page.getByRole("dialog", { name: "Edit client" });
  await editDialog.getByLabel(/^Name/).fill("Jane C. Cooper");
  await editDialog.getByRole("radio", { name: "Active" }).click();
  await editDialog.getByRole("button", { name: "Save changes" }).click();
  await expect(editDialog).toBeHidden();
  await expect(page.getByRole("link", { name: "Jane C. Cooper" })).toBeVisible();

  // Delete
  await page.getByRole("button", { name: "Delete Jane C. Cooper" }).click();
  const confirm = page.getByRole("alertdialog", { name: "Delete client?" });
  await confirm.getByRole("button", { name: "Delete" }).click();
  await expect(confirm).toBeHidden();
  await expect(page.getByText("No clients found")).toBeVisible();
  await expect(page.getByText("50 clients in your pipeline")).toBeVisible();
});

test("validation errors and a duplicate email are explained in the form", async ({ page }) => {
  await openClients(page);
  await page.getByRole("button", { name: "Add client" }).click();
  const dialog = page.getByRole("dialog", { name: "New client" });

  await dialog.getByRole("button", { name: "Add client" }).click();
  await expect(dialog.getByText("Name must be at least 2 characters")).toBeVisible();

  await dialog.getByLabel(/^Name/).fill("Copy Cat");
  await dialog.getByLabel(/^Email/).fill("olivia@northwind.io");
  await dialog.getByLabel(/^Phone/).fill("+44 20 7946 0999");
  await dialog.getByRole("button", { name: "Add client" }).click();
  await expect(dialog.getByText("A client with this email already exists.")).toBeVisible();
});

test("data persists across a reload (mock database in localStorage)", async ({ page }) => {
  await openClients(page);
  await page.getByRole("button", { name: "Delete Olivia Bennett" }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Delete" }).click();
  await expect(page.getByText("49 clients in your pipeline")).toBeVisible();

  await page.reload();
  await expect(page.getByText("49 clients in your pipeline")).toBeVisible();
});
