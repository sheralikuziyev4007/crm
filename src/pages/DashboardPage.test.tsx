import { describe, it, expect } from "vitest";
import { screen, within } from "@testing-library/react";
import { setBaseLatency, setMockControls } from "@/mocks/controls";
import { db } from "@/mocks/db";
import { renderApp } from "@/test/utils";

describe("dashboard", () => {
  it("shows a skeleton, then the stats for every stage", async () => {
    // A short delay keeps the skeleton on screen long enough to be seen, even on a slow machine
    setBaseLatency(300);
    renderApp({ route: "/" });
    expect(await screen.findByText("Loading dashboard…")).toBeInTheDocument();
    expect(await screen.findByText("Total clients")).toBeInTheDocument();
    expect(screen.getByText("Welcome back, Alex. Here is your pipeline today.")).toBeInTheDocument();

    expect(screen.getByRole("button", { name: /^Lead 15 View clients/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Active 23 View clients/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Closed 12 View clients/ })).toBeInTheDocument();
  });

  it("opens the client list filtered by the stage you click", async () => {
    const { user, router } = renderApp({ route: "/" });
    await user.click(await screen.findByRole("button", { name: /^Closed 12 View clients/ }));

    expect(await screen.findByRole("table")).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/clients");
    expect(screen.getByLabelText("Filter by status")).toHaveValue("closed");
    expect(screen.getByText("1–10 of 12")).toBeInTheDocument();
  });

  it("gives every chart value an accessible name and a table view", async () => {
    renderApp({ route: "/" });
    expect(await screen.findByRole("img", { name: /Lead: 15 clients \(30%\)/ })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /Active: 23 clients \(46%\)/ })).toBeInTheDocument();
    expect(screen.getAllByRole("img", { name: /new client/ })).toHaveLength(8);

    const stageTable = screen.getByRole("table", { name: "Clients per pipeline stage" });
    expect(within(stageTable).getByRole("row", { name: "Closed 12 24%" })).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "New clients per week" })).toBeInTheDocument();
  });

  it("lists recent activity and recently added clients with links", async () => {
    renderApp({ route: "/" });
    const feed = within(await screen.findByRole("list", { name: "Recent activity" }));
    expect(feed.getAllByRole("listitem")).toHaveLength(8);
    expect(screen.getAllByRole("link", { name: "Priya Raman" })[0]).toHaveAttribute(
      "href",
      "/clients/CL-005",
    );
  });

  it("shows an error with Try again", async () => {
    setMockControls({ serverError: true });
    const { user } = renderApp({ route: "/" });
    expect(await screen.findByText("Couldn't load the dashboard")).toBeInTheDocument();
    setMockControls({ serverError: false });
    await user.click(screen.getAllByRole("button", { name: "Try again" })[0]);
    expect(await screen.findByText("Total clients")).toBeInTheDocument();
  });

  it("copes with an empty account", async () => {
    db.reset("empty");
    renderApp({ route: "/" });
    expect(await screen.findByText("Total clients")).toBeInTheDocument();
    expect(await screen.findByText("Nothing has happened yet.")).toBeInTheDocument();
    expect(screen.getAllByText("No clients yet.").length).toBeGreaterThan(0);
  });
});
