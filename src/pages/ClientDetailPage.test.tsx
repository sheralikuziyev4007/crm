import { describe, it, expect } from "vitest";
import { screen, within } from "@testing-library/react";
import { setMockControls } from "@/mocks/controls";
import { db } from "@/mocks/db";
import { renderApp } from "@/test/utils";

const openClient = async (id = "CL-001") => {
  const result = renderApp({ route: `/clients/${id}` });
  await screen.findByRole("heading", { level: 1 });
  return result;
};

// Notes and history load separately from the client, so wait for each list to appear
const notesList = async () => within(await screen.findByRole("list", { name: "Notes" }));
const activity = async () => within(await screen.findByRole("list", { name: "Client activity" }));

describe("client page", () => {
  it("shows the client's details with working contact links", async () => {
    await openClient();
    expect(screen.getByRole("heading", { level: 1, name: "Olivia Bennett" })).toBeInTheDocument();
    expect(document.title).toBe("Olivia Bennett · Pipeline CRM");
    expect(screen.getByRole("link", { name: "olivia@northwind.io" })).toHaveAttribute(
      "href",
      "mailto:olivia@northwind.io",
    );
    expect(screen.getByRole("link", { name: "+1 415 555 0132" })).toHaveAttribute("href", "tel:+14155550132");
    expect(screen.getByRole("radio", { name: "Lead" })).toHaveAttribute("aria-checked", "true");
  });

  it("shows the seeded notes and history", async () => {
    await openClient();
    expect(await (await notesList()).findByText(/Intro call booked for Thursday/)).toBeInTheDocument();
    expect(await (await activity()).findByText("Client added")).toBeInTheDocument();
    expect((await activity()).getByText("Note added")).toBeInTheDocument();
  });

  it("adds a note, which also appears in the history", async () => {
    const { user } = await openClient();
    await user.type(screen.getByLabelText("New note"), "Sent pricing for 25 seats");
    expect(screen.getByText("25/1000")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Add note" }));

    expect(await (await notesList()).findByText("Sent pricing for 25 seats")).toBeInTheDocument();
    expect(screen.getByLabelText("New note")).toHaveValue("");
    expect(await (await activity()).findByText("“Sent pricing for 25 seats”")).toBeInTheDocument();
  });

  it("does not save an empty note", async () => {
    const { user } = await openClient();
    await user.click(screen.getByRole("button", { name: "Add note" }));
    expect(await screen.findByText("Write something first")).toBeInTheDocument();
  });

  it("deletes a note", async () => {
    const { user } = await openClient();
    await (await notesList()).findByText(/Intro call booked/);
    await user.click((await notesList()).getByRole("button", { name: "Delete note" }));
    expect(await screen.findByText("Note deleted")).toBeInTheDocument();
    // Olivia had one note; the history still mentions it, which is the point of a history
    expect(await screen.findByText("No notes yet")).toBeInTheDocument();
    expect(screen.queryByRole("list", { name: "Notes" })).not.toBeInTheDocument();
  });

  it("changes the pipeline stage optimistically and records it", async () => {
    const { user } = await openClient();
    await user.click(screen.getByRole("radio", { name: "Active" }));
    expect(screen.getByRole("radio", { name: "Active" })).toHaveAttribute("aria-checked", "true");
    expect(await (await activity()).findByText("Moved from Lead to Active")).toBeInTheDocument();
    expect(db.findClient("CL-001")?.status).toBe("active");
  });

  it("edits the client from its page", async () => {
    const { user } = await openClient();
    await user.click(screen.getByRole("button", { name: "Edit" }));
    const dialog = screen.getByRole("dialog", { name: "Edit client" });
    const company = within(dialog).getByLabelText(/^company/i);
    await user.clear(company);
    await user.type(company, "Northwind Labs");
    await user.click(within(dialog).getByRole("button", { name: "Save changes" }));

    expect(await screen.findByText("Client updated")).toBeInTheDocument();
    expect(await (await activity()).findByText("Updated company")).toBeInTheDocument();
    expect(screen.getAllByText("Northwind Labs").length).toBeGreaterThan(0);
  });

  it("deletes the client and goes back to the list", async () => {
    const { user, router } = await openClient();
    await user.click(screen.getByRole("button", { name: "Delete" }));
    await user.click(within(await screen.findByRole("alertdialog")).getByRole("button", { name: "Delete" }));

    expect(await screen.findByRole("heading", { name: "Clients" })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe("/clients");
    expect(db.findClient("CL-001")).toBeUndefined();
  });

  it("says so when the client does not exist", async () => {
    renderApp({ route: "/clients/CL-999" });
    expect(await screen.findByText("Client not found")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to clients" })).toHaveAttribute("href", "/clients");
  });

  it("shows an error with Try again when loading fails", async () => {
    setMockControls({ serverError: true });
    const { user } = renderApp({ route: "/clients/CL-001" });
    expect(await screen.findByText("Couldn't load this client")).toBeInTheDocument();

    setMockControls({ serverError: false });
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(await screen.findByRole("heading", { level: 1, name: "Olivia Bennett" })).toBeInTheDocument();
  });
});
