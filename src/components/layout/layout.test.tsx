import { describe, it, expect } from "vitest";
import { screen, within } from "@testing-library/react";
import { renderApp } from "@/test/utils";

describe("app layout", () => {
  it("marks the current page in the navigation and sets the document title", async () => {
    renderApp({ route: "/clients" });
    await screen.findByRole("heading", { name: "Clients" });
    const nav = within(screen.getByRole("navigation", { name: "Main" }));
    expect(nav.getByRole("link", { name: "Clients" })).toHaveAttribute("aria-current", "page");
    expect(nav.getByRole("link", { name: "Dashboard" })).not.toHaveAttribute("aria-current");
    expect(document.title).toBe("Clients · Pipeline CRM");
  });

  it("has a skip link to the main content", async () => {
    renderApp({ route: "/" });
    expect(await screen.findByRole("link", { name: "Skip to content" })).toHaveAttribute(
      "href",
      "#main-content",
    );
    expect(document.getElementById("main-content")?.tagName).toBe("MAIN");
  });

  it("opens the mobile menu and closes it after navigating", async () => {
    const { user, router } = renderApp({ route: "/" });
    await user.click(await screen.findByRole("button", { name: "Open menu" }));
    const menu = await screen.findByRole("dialog", { name: "Navigation" });
    await user.click(within(menu).getByRole("link", { name: "Settings" }));

    expect(await screen.findByRole("heading", { name: "Settings" })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/settings");
    expect(screen.queryByRole("dialog", { name: "Navigation" })).not.toBeInTheDocument();
  });

  it("toggles the theme from the top bar", async () => {
    const { user } = renderApp({ route: "/" });
    await user.click(await screen.findByRole("button", { name: "Switch to dark theme" }));
    expect(document.documentElement).toHaveClass("dark");
    expect(screen.getByRole("button", { name: "Switch to light theme" })).toBeInTheDocument();
  });

  it("shows a friendly page for unknown URLs", async () => {
    renderApp({ route: "/does-not-exist" });
    expect(await screen.findByText("This page does not exist")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Go to the dashboard" })).toHaveAttribute("href", "/");
  });
});
