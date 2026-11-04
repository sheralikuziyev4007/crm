import { describe, it, expect, vi, afterEach } from "vitest";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { API_URL } from "@/lib/http";
import { STORAGE_KEYS } from "@/lib/constants";
import { setBaseLatency, setMockControls } from "@/mocks/controls";
import { db } from "@/mocks/db";
import { server } from "@/mocks/server";
import { useClientFiltersStore } from "@/store/clientFiltersStore";
import { cellText, renderApp, renderClientsPage, tableRows } from "@/test/utils";

// Seed: 50 clients (15 lead, 23 active, 12 closed); CL-001 is Olivia Bennett, a lead.

const table = () => within(screen.getByRole("table"));

async function fillClientForm(user: ReturnType<typeof renderApp>["user"], values: Record<string, string>) {
  const dialog = screen.getByRole("dialog");
  for (const [label, value] of Object.entries(values)) {
    const field = within(dialog).getByLabelText(new RegExp(`^${label}`, "i"));
    await user.clear(field);
    if (value) await user.type(field, value);
  }
  return dialog;
}

describe("loading, error and empty states", () => {
  it("shows a skeleton, then the first page of clients", async () => {
    renderApp({ route: "/clients" });
    expect(await screen.findByText("Loading clients…")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add client/i })).toBeDisabled();

    expect(await screen.findByRole("table")).toBeInTheDocument();
    expect(tableRows()).toHaveLength(10);
    expect(screen.getByText("50 clients in your pipeline")).toBeInTheDocument();
    expect(screen.getByText("1–10 of 50")).toBeInTheDocument();
  });

  it("shows an error with Try again, and recovers", async () => {
    setMockControls({ serverError: true });
    const { user } = renderApp({ route: "/clients" });

    const alert = await screen.findByRole("alert");
    expect(within(alert).getByText("Couldn't load clients")).toBeInTheDocument();
    expect(within(alert).getByText(/internal server error/i)).toBeInTheDocument();

    setMockControls({ serverError: false });
    await user.click(within(alert).getByRole("button", { name: "Try again" }));
    expect(await screen.findByRole("table")).toBeInTheDocument();
  });

  it("invites you to add the first client when there are none", async () => {
    db.reset("empty");
    const { user } = renderApp({ route: "/clients" });
    expect(await screen.findByText("No clients yet")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Add your first client" }));
    await fillClientForm(user, { Name: "First Client", Email: "first@client.io", Phone: "+44 20 7946 0999" });
    await user.click(screen.getByRole("button", { name: "Add client" }));

    expect(await screen.findByRole("table")).toBeInTheDocument();
    expect(tableRows()).toHaveLength(1);
    expect(screen.getByText("1 client in your pipeline")).toBeInTheDocument();
  });

  it("offers to clear the filters when nothing matches", async () => {
    const { user } = await renderClientsPage();
    await user.type(screen.getByLabelText("Search clients"), "zzzzzz");
    expect(await screen.findByText("No clients found")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /export csv/i })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(screen.getByLabelText("Search clients")).toHaveValue("");
    expect(screen.queryByText("No clients found")).not.toBeInTheDocument();
    expect(tableRows()).toHaveLength(10);
  });
});

describe("search, filter, sort and pagination", () => {
  it("searches by name, company and email with a debounce", async () => {
    const { user } = await renderClientsPage();
    await user.type(screen.getByLabelText("Search clients"), "northwind");
    await waitFor(() => expect(tableRows()).toHaveLength(1));
    expect(cellText(tableRows()[0], 1)).toBe("Olivia Bennett");
  });

  it("filters by status and resets to page 1", async () => {
    const { user } = await renderClientsPage();
    await user.click(screen.getByRole("button", { name: "Next page" }));
    expect(screen.getByText("11–20 of 50")).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("Filter by status"), "lead");
    expect(screen.getByText("1–10 of 15")).toBeInTheDocument();
    expect(tableRows().every((row) => within(row).queryByText("Lead"))).toBe(true);
  });

  it("cycles a column's sort asc → desc → off and exposes aria-sort", async () => {
    const { user } = await renderClientsPage();
    const header = table().getByRole("button", { name: /^name/i });

    await user.click(header);
    expect(cellText(tableRows()[0], 1)).toBe("Aigerim Sadykova");
    expect(header.closest("th")).toHaveAttribute("aria-sort", "ascending");

    await user.click(header);
    expect(cellText(tableRows()[0], 1)).toBe("Zeynep Aydın");
    expect(header.closest("th")).toHaveAttribute("aria-sort", "descending");

    await user.click(header);
    expect(cellText(tableRows()[0], 0)).toBe("CL-001");
    expect(header.closest("th")).toHaveAttribute("aria-sort", "none");
  });

  it("sorts with the select (used on phones and in Kanban) and flips the direction", async () => {
    const { user } = await renderClientsPage();
    await user.selectOptions(screen.getByLabelText("Sort by"), "createdAt");
    expect(cellText(tableRows()[0], 1)).toBe("Thomas Becker");
    await user.click(screen.getByRole("button", { name: /switch to descending/i }));
    expect(cellText(tableRows()[0], 1)).toBe("Priya Raman");
  });

  it("changes the page size and remembers it", async () => {
    const { user } = await renderClientsPage();
    await user.selectOptions(screen.getByLabelText("Per page"), "20");
    expect(tableRows()).toHaveLength(20);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.clientsView)!).state).toMatchObject({ pageSize: 20 });
  });

  it("clamps the page when its last row is deleted", async () => {
    const { user } = await renderClientsPage();
    await user.selectOptions(screen.getByLabelText("Filter by status"), "closed");
    await user.click(screen.getByRole("button", { name: "Next page" }));
    expect(tableRows()).toHaveLength(2);

    for (let i = 0; i < 2; i++) {
      await user.click(table().getAllByRole("button", { name: /^Delete / })[0]);
      await user.click(
        within(await screen.findByRole("alertdialog")).getByRole("button", { name: "Delete" }),
      );
      await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
    }
    await waitFor(() => expect(tableRows()).toHaveLength(10));
    expect(screen.getByText("48 clients in your pipeline")).toBeInTheDocument();
  });

  it("keeps the filters when you leave the page and come back (Zustand store)", async () => {
    const { user } = await renderClientsPage();
    await user.selectOptions(screen.getByLabelText("Filter by status"), "active");
    await user.click(table().getByRole("link", { name: "Lucas Moreau" }));
    expect(await screen.findByRole("heading", { name: "Lucas Moreau" })).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: "All clients" }));
    expect(await screen.findByRole("table")).toBeInTheDocument();
    expect(screen.getByLabelText("Filter by status")).toHaveValue("active");
    expect(useClientFiltersStore.getState().status).toBe("active");
  });
});

describe("add, edit and delete", () => {
  it("validates the form and shows the international phone hint", async () => {
    const { user } = await renderClientsPage();
    await user.click(screen.getByRole("button", { name: "Add client" }));
    const dialog = screen.getByRole("dialog", { name: "New client" });
    expect(within(dialog).getByLabelText(/^name/i)).toHaveFocus();
    expect(within(dialog).getByText("Include the country code, e.g. +1 415 555 0132")).toBeInTheDocument();

    await fillClientForm(user, { Name: "J", Email: "jane@", Phone: "555 0132" });
    await user.click(within(dialog).getByRole("button", { name: "Add client" }));

    expect(within(dialog).getByText("Name must be at least 2 characters")).toBeInTheDocument();
    expect(within(dialog).getByText("Enter a valid email address")).toBeInTheDocument();
    expect(within(dialog).getByText("Include the country code, e.g. +1 415 555 0132")).toBeInTheDocument();
    expect(within(dialog).getByLabelText(/^name/i)).toHaveFocus();
  });

  it("adds a client and confirms with a toast", async () => {
    const { user } = await renderClientsPage();
    await user.click(screen.getByRole("button", { name: "Add client" }));
    await fillClientForm(user, {
      Name: "  Jane Cooper ",
      Company: "Acme",
      Email: "jane@acme.com",
      Phone: "+1  415 555 0177",
    });
    await user.click(within(screen.getByRole("dialog")).getByRole("radio", { name: "Active" }));
    await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Add client" }));

    expect(await screen.findByText("Client added")).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(screen.getByText("51 clients in your pipeline")).toBeInTheDocument();
    expect(db.findClient("CL-051")).toMatchObject({
      name: "Jane Cooper",
      phone: "+1 415 555 0177",
      status: "active",
    });
  });

  it("puts a server error next to the field it belongs to and keeps the dialog open", async () => {
    const { user } = await renderClientsPage();
    await user.click(screen.getByRole("button", { name: "Add client" }));
    const dialog = await fillClientForm(user, {
      Name: "Copy Cat",
      Email: "olivia@northwind.io",
      Phone: "+1 415 555 0101",
    });
    await user.click(within(dialog).getByRole("button", { name: "Add client" }));

    expect(await within(dialog).findByText("A client with this email already exists.")).toBeInTheDocument();
    expect(within(dialog).getByLabelText(/^email/i)).toHaveAttribute("aria-invalid", "true");
    expect(within(dialog).getByLabelText(/^email/i)).toHaveFocus();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("shows progress while saving", async () => {
    const { user } = await renderClientsPage();
    setBaseLatency(150);
    await user.click(screen.getByRole("button", { name: "Add client" }));
    const dialog = await fillClientForm(user, {
      Name: "Slow Saver",
      Email: "slow@saver.io",
      Phone: "+1 415 555 0102",
    });
    await user.click(within(dialog).getByRole("button", { name: "Add client" }));
    expect(within(dialog).getByRole("button", { name: "Saving…" })).toBeDisabled();
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("edits a client", async () => {
    const { user } = await renderClientsPage();
    await user.click(table().getByRole("button", { name: "Edit Olivia Bennett" }));
    const dialog = screen.getByRole("dialog", { name: "Edit client" });
    expect(within(dialog).getByLabelText(/^name/i)).toHaveValue("Olivia Bennett");

    await fillClientForm(user, { Name: "Olivia B. Bennett" });
    await user.click(within(dialog).getByRole("button", { name: "Save changes" }));

    expect(await screen.findByText("Client updated")).toBeInTheDocument();
    expect(await table().findByText("Olivia B. Bennett")).toBeInTheDocument();
  });

  it("does not throw away a dirty form on an outside click, but Escape closes it", async () => {
    const { user } = await renderClientsPage();
    await user.click(screen.getByRole("button", { name: "Add client" }));
    await fillClientForm(user, { Name: "Draft" });
    fireEvent.pointerDown(document.body);
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(screen.getByRole("button", { name: "Add client" })).toHaveFocus();
  });

  it("asks before deleting, with focus on Cancel", async () => {
    const { user } = await renderClientsPage();
    await user.click(table().getByRole("button", { name: "Delete Olivia Bennett" }));
    const dialog = await screen.findByRole("alertdialog", { name: "Delete client?" });
    expect(dialog).toHaveAccessibleDescription(/cannot be undone/);
    expect(within(dialog).getByRole("button", { name: "Cancel" })).toHaveFocus();

    await user.click(within(dialog).getByRole("button", { name: "Cancel" }));
    expect(screen.getByText("50 clients in your pipeline")).toBeInTheDocument();
  });

  it("deletes after confirmation", async () => {
    const { user } = await renderClientsPage();
    await user.click(table().getByRole("button", { name: "Delete Olivia Bennett" }));
    await user.click(within(await screen.findByRole("alertdialog")).getByRole("button", { name: "Delete" }));

    expect(await screen.findByText("Client deleted")).toBeInTheDocument();
    expect(await screen.findByText("49 clients in your pipeline")).toBeInTheDocument();
    expect(table().queryByText("Olivia Bennett")).not.toBeInTheDocument();
  });

  it("keeps the delete dialog open with the error when deleting fails", async () => {
    const { user } = await renderClientsPage();
    setMockControls({ serverError: true });
    await user.click(table().getByRole("button", { name: "Delete Olivia Bennett" }));
    const dialog = await screen.findByRole("alertdialog");
    await user.click(within(dialog).getByRole("button", { name: "Delete" }));

    expect(await within(dialog).findByText(/internal server error/i)).toBeInTheDocument();
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  });
});

describe("Kanban board", () => {
  const column = (name: string) => within(screen.getByRole("region", { name }));
  const card = (name: string) => screen.getByRole("link", { name }).closest("li") as HTMLElement;

  it("moves a card with the arrow buttons (works on touch screens and with a keyboard)", async () => {
    const { user } = await renderClientsPage();
    await user.click(screen.getByRole("button", { name: "Kanban" }));
    expect(column("Lead").getByText("15")).toBeInTheDocument();

    await user.click(within(card("Olivia Bennett")).getByRole("button", { name: "Move to Active" }));
    await waitFor(() =>
      expect(column("Active").getByRole("link", { name: "Olivia Bennett" })).toBeInTheDocument(),
    );
    expect(column("Lead").getByText("14")).toBeInTheDocument();
    expect(db.findClient("CL-001")?.status).toBe("active");
  });

  it("moves a card with drag and drop", async () => {
    const { user } = await renderClientsPage();
    await user.click(screen.getByRole("button", { name: "Kanban" }));
    const dataTransfer = { setData: vi.fn(), getData: () => "CL-001", effectAllowed: "" };
    const closed = screen.getByRole("region", { name: "Closed" });

    fireEvent.dragStart(card("Olivia Bennett"), { dataTransfer });
    fireEvent.dragOver(closed, { dataTransfer });
    fireEvent.drop(closed, { dataTransfer });

    await waitFor(() =>
      expect(column("Closed").getByRole("link", { name: "Olivia Bennett" })).toBeInTheDocument(),
    );
  });

  it("puts the card back and explains when the server rejects the move", async () => {
    const { user } = await renderClientsPage();
    await user.click(screen.getByRole("button", { name: "Kanban" }));
    server.use(
      http.patch(`${API_URL}/clients/:id`, () => HttpResponse.json({ message: "Conflict" }, { status: 409 })),
    );

    await user.click(within(card("Olivia Bennett")).getByRole("button", { name: "Move to Active" }));
    expect(await screen.findByText("Couldn't move the client")).toBeInTheDocument();
    await waitFor(() =>
      expect(column("Lead").getByRole("link", { name: "Olivia Bennett" })).toBeInTheDocument(),
    );
  });
});

describe("CSV export", () => {
  afterEach(() => vi.restoreAllMocks());

  it("downloads exactly the filtered, sorted list", async () => {
    let blob: Blob | undefined;
    Object.assign(URL, {
      createObjectURL: vi.fn((b: Blob) => {
        blob = b;
        return "blob:x";
      }),
      revokeObjectURL: vi.fn(),
    });
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    const { user } = await renderClientsPage();
    await user.selectOptions(screen.getByLabelText("Filter by status"), "closed");
    await user.selectOptions(screen.getByLabelText("Sort by"), "name");
    await user.click(screen.getByRole("button", { name: /export csv/i }));

    expect(await screen.findByText("Exported 12 clients")).toBeInTheDocument();
    const text = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.readAsText(blob!);
    });
    const lines = text.replace(/^\uFEFF/, "").split("\r\n");
    expect(lines[0]).toBe("ID,Name,Company,Email,Phone,Status,Date added");
    expect(lines).toHaveLength(13);
    expect(lines[1]).toMatch(
      /^CL-\d{3},Arjun Mehta,Mehta Pharma,arjun@mehtapharma\.in,\+91 22 6180 4402,Closed,\d{4}-\d{2}-\d{2}$/,
    );
  });
});
