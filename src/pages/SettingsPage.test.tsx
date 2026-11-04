import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { STORAGE_KEYS } from "@/lib/constants";
import { getMockControls } from "@/mocks/controls";
import { db } from "@/mocks/db";
import { renderApp } from "@/test/utils";

describe("settings", () => {
  it("shows the signed-in account", async () => {
    renderApp({ route: "/settings" });
    expect(await screen.findByText("demo@pipelinecrm.app · Sales manager")).toBeInTheDocument();
  });

  it("switches the theme and remembers the choice", async () => {
    const { user } = renderApp({ route: "/settings" });
    await user.click(await screen.findByRole("radio", { name: "Dark" }));
    expect(document.documentElement).toHaveClass("dark");
    expect(localStorage.getItem(STORAGE_KEYS.theme)).toBe("dark");

    await user.click(screen.getByRole("radio", { name: "System" }));
    expect(screen.getByRole("radio", { name: "System" })).toHaveAttribute("aria-checked", "true");
    // The test browser reports a light system theme
    expect(document.documentElement).not.toHaveClass("dark");
  });

  it("turns on the simulated server error, which the other pages then show", async () => {
    const { user } = renderApp({ route: "/settings" });
    await user.click(await screen.findByRole("switch", { name: "Server error (500)" }));
    expect(getMockControls().serverError).toBe(true);

    await user.click(screen.getByRole("button", { name: "Reload all data" }));
    await user.click(screen.getAllByRole("link", { name: "Clients" })[0]);
    expect(await screen.findByText("Couldn't load clients")).toBeInTheDocument();
  });

  it("removes every client and restores the demo data", async () => {
    const { user } = renderApp({ route: "/settings" });
    await user.click(await screen.findByRole("button", { name: "Remove all clients" }));
    expect(await screen.findByText("All clients removed")).toBeInTheDocument();
    expect(db.listClients()).toHaveLength(0);

    await user.click(screen.getByRole("button", { name: "Restore demo data" }));
    expect(await screen.findByText("Demo data restored")).toBeInTheDocument();
    expect(db.listClients()).toHaveLength(50);
  });
});
