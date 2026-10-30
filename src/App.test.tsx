import { describe, it, expect } from "vitest";
import { render, screen, within, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import { STORAGE_KEY } from "./utils/constants";
import { seedClients } from "./utils/idGenerator";

// Seed: 14 клиентов — 5 lead, 6 active, 3 closed
const setup = () => ({ user: userEvent.setup(), ...render(<App />) });
type User = ReturnType<typeof userEvent.setup>;

const tableRows = () => within(screen.getByRole("table")).getAllByRole("row").slice(1);
const cell = (row: HTMLElement, index: number) => within(row).getAllByRole("cell")[index].textContent;
// Карточки статистики — единственные кнопки с aria-pressed и таким именем (в канбане есть похожие «Переместить в Lead»)
const statCard = (label: RegExp) =>
  screen.getAllByRole("button", { name: label }).find((b) => b.hasAttribute("aria-pressed") && /^\D*\d+$/.test(b.textContent ?? ""))!;
const openAddModal = (user: User) => user.click(screen.getByRole("button", { name: /добавить клиента/i }));

describe("list, stats and pagination", () => {
  it("shows the first page of the seed data with a pagination summary", () => {
    setup();
    expect(tableRows()).toHaveLength(10);
    expect(screen.getByText("1–10 из 14")).toBeInTheDocument();
    expect(screen.getByText(/14 записей/)).toBeInTheDocument();
  });

  it("navigates to the next page", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("button", { name: "Следующая страница" }));
    expect(tableRows()).toHaveLength(4);
    expect(screen.getByText("11–14 из 14")).toBeInTheDocument();
  });

  it("changes the page size and returns to page 1", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("button", { name: "Следующая страница" }));
    await user.selectOptions(screen.getByLabelText(/на странице/i), "5");
    expect(tableRows()).toHaveLength(5);
    expect(screen.getByText("1–5 из 14")).toBeInTheDocument();
  });

  it("shows counters per status", () => {
    setup();
    expect(statCard(/всего/i)).toHaveTextContent("14");
    expect(statCard(/lead/i)).toHaveTextContent("5");
    expect(statCard(/active/i)).toHaveTextContent("6");
    expect(statCard(/closed/i)).toHaveTextContent("3");
  });

  it("filters by status when a stat card is clicked, and hides pagination", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("button", { name: "Следующая страница" }));
    await user.click(statCard(/lead/i));
    expect(statCard(/lead/i)).toHaveAttribute("aria-pressed", "true");
    expect(tableRows()).toHaveLength(5);
    expect(screen.getByLabelText("Фильтр по статусу")).toHaveValue("lead");
    expect(screen.queryByRole("navigation", { name: "Пагинация" })).not.toBeInTheDocument();
  });

  it("searches by name, company and email with debounce", async () => {
    const { user } = setup();
    await user.type(screen.getByLabelText("Поиск клиентов"), "techsoft");
    await waitFor(() => expect(tableRows()).toHaveLength(1));
    expect(cell(tableRows()[0], 1)).toBe("Aziz Karimov");
  });

  it("shows an empty state when nothing matches", async () => {
    const { user } = setup();
    await user.type(screen.getByLabelText("Поиск клиентов"), "zzzzzz");
    expect(await screen.findByText("Клиенты не найдены")).toBeInTheDocument();
  });
});

describe("sorting", () => {
  it("cycles asc → desc → none when a column header is clicked", async () => {
    const { user } = setup();
    const header = within(screen.getByRole("table")).getByRole("button", { name: /имя/i });

    await user.click(header);
    expect(cell(tableRows()[0], 1)).toBe("Aziz Karimov");
    expect(header.closest("th")).toHaveAttribute("aria-sort", "ascending");

    await user.click(header);
    expect(cell(tableRows()[0], 1)).toBe("Zarina Qodirova");
    expect(header.closest("th")).toHaveAttribute("aria-sort", "descending");

    await user.click(header);
    expect(cell(tableRows()[0], 0)).toBe("CL-001");
    expect(header.closest("th")).toHaveAttribute("aria-sort", "none");
  });

  it("sorts via the select (used on mobile) and toggles direction", async () => {
    const { user } = setup();
    expect(screen.getByRole("button", { name: "По возрастанию" })).toBeDisabled(); // пока нет ключа сортировки

    await user.selectOptions(screen.getByLabelText("Сортировка"), "createdAt");
    expect(cell(tableRows()[0], 1)).toBe("Madina Ergasheva"); // добавлена 25 дней назад — самая старая

    await user.click(screen.getByRole("button", { name: "По возрастанию" }));
    expect(cell(tableRows()[0], 1)).toBe("Zarina Qodirova"); // добавлена «сегодня» — самая свежая
    expect(screen.getByRole("button", { name: "По убыванию" })).toBeEnabled();
  });
});

describe("add / edit form", () => {
  it("opens an accessible dialog with focus on the first field", async () => {
    const { user } = setup();
    await openAddModal(user);
    const dialog = screen.getByRole("dialog", { name: "Новый клиент" });
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(within(dialog).getByLabelText(/имя/i)).toHaveFocus();
    expect(document.body).toHaveStyle({ overflow: "hidden" });
  });

  it("keeps Save enabled, shows all errors on submit and focuses the first invalid field", async () => {
    const { user } = setup();
    await openAddModal(user);
    const dialog = screen.getByRole("dialog");
    const save = within(dialog).getByRole("button", { name: "Сохранить" });

    expect(save).toBeEnabled();
    await user.click(save);

    expect(within(dialog).getAllByRole("alert")).toHaveLength(3);
    const name = within(dialog).getByLabelText(/имя/i);
    expect(name).toHaveAttribute("aria-invalid", "true");
    expect(name).toHaveAccessibleDescription(/минимум 2 символа/);
    expect(name).toHaveFocus();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("formats the phone while typing and saves a trimmed client", async () => {
    const { user } = setup();
    await openAddModal(user);
    const dialog = screen.getByRole("dialog");

    await user.type(within(dialog).getByLabelText(/имя/i), "  New Person  ");
    await user.type(within(dialog).getByLabelText(/email/i), "new@person.uz ");
    await user.type(within(dialog).getByLabelText(/телефон/i), "901112233");
    expect(within(dialog).getByLabelText(/телефон/i)).toHaveValue("+998 90 111 22 33");

    await user.click(within(dialog).getByRole("button", { name: "Сохранить" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Клиент добавлен");
    expect(screen.getByText(/15 записей/)).toBeInTheDocument();

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!).at(-1);
    expect(saved).toMatchObject({ name: "New Person", email: "new@person.uz", phone: "+998 90 111 22 33", status: "lead" });
  });

  it("edits an existing client", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("button", { name: "Редактировать Aziz Karimov" }));
    const dialog = screen.getByRole("dialog", { name: "Редактировать клиента" });
    const name = within(dialog).getByLabelText(/имя/i);
    expect(name).toHaveValue("Aziz Karimov");

    await user.clear(name);
    await user.type(name, "Aziz K.");
    await user.click(within(dialog).getByRole("button", { name: "Active" }));
    await user.click(within(dialog).getByRole("button", { name: "Сохранить" }));

    expect(screen.getByRole("status")).toHaveTextContent("Клиент обновлён");
    expect(within(screen.getByRole("table")).getByText("Aziz K.")).toBeInTheDocument();
    expect(statCard(/active/i)).toHaveTextContent("7");
  });
});

describe("modal behaviour", () => {
  it("closes on Escape and returns focus to the opener", async () => {
    const { user } = setup();
    const opener = screen.getByRole("button", { name: /добавить клиента/i });
    await user.click(opener);
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
    expect(document.body).not.toHaveStyle({ overflow: "hidden" });
  });

  it("traps focus: Tab on the last element wraps to the first, Shift+Tab goes back", async () => {
    const { user } = setup();
    await openAddModal(user);
    const dialog = screen.getByRole("dialog");
    const close = within(dialog).getByRole("button", { name: "Закрыть" });
    const save = within(dialog).getByRole("button", { name: "Сохранить" });

    save.focus();
    await user.tab();
    expect(close).toHaveFocus();
    await user.tab({ shift: true });
    expect(save).toHaveFocus();
  });

  it("closes a clean form on overlay click, but not a dirty one", async () => {
    const { user } = setup();
    await openAddModal(user);
    fireEvent.mouseDown(screen.getByRole("dialog").parentElement!);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await openAddModal(user);
    await user.type(within(screen.getByRole("dialog")).getByLabelText(/имя/i), "Draft");
    fireEvent.mouseDown(screen.getByRole("dialog").parentElement!);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});

describe("delete", () => {
  it("asks for confirmation with focus on the safe action, and can be cancelled", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("button", { name: "Удалить Aziz Karimov" }));
    const dialog = screen.getByRole("alertdialog");
    expect(dialog).toHaveAccessibleDescription(/без возможности восстановления/);
    expect(within(dialog).getByRole("button", { name: "Отмена" })).toHaveFocus();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(screen.getByText(/14 записей/)).toBeInTheDocument();
  });

  it("deletes after confirmation", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("button", { name: "Удалить Aziz Karimov" }));
    await user.click(within(screen.getByRole("alertdialog")).getByRole("button", { name: "Удалить" }));
    expect(screen.getByRole("status")).toHaveTextContent("Клиент удалён");
    expect(screen.getByText(/13 записей/)).toBeInTheDocument();
    expect(within(screen.getByRole("table")).queryByText("Aziz Karimov")).not.toBeInTheDocument();
  });

  it("clamps the page when the last page becomes empty", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("button", { name: "Следующая страница" }));
    for (let i = 0; i < 4; i++) {
      await user.click(within(screen.getByRole("table")).getAllByRole("button", { name: /^Удалить / })[0]);
      await user.click(within(screen.getByRole("alertdialog")).getByRole("button", { name: "Удалить" }));
    }
    expect(tableRows()).toHaveLength(10);
    expect(screen.getByText(/10 записей/)).toBeInTheDocument();
  });
});

describe("kanban", () => {
  const card = (name: string) => screen.getByText(name).closest("[draggable]") as HTMLElement;
  const openKanban = (user: User) => user.click(screen.getByRole("button", { name: /kanban/i }));

  it("moves a card with the arrow buttons (touch-friendly alternative to drag & drop)", async () => {
    const { user } = setup();
    await openKanban(user);
    await user.click(within(card("Aziz Karimov")).getByRole("button", { name: "Переместить в Active" }));
    expect(statCard(/lead/i)).toHaveTextContent("4");
    expect(statCard(/active/i)).toHaveTextContent("7");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("moves a card with drag & drop", async () => {
    const { user } = setup();
    await openKanban(user);
    const dataTransfer = { setData: () => {}, getData: () => "CL-001" };
    const closedColumn = document.querySelector<HTMLElement>('[data-status="closed"]')!;

    fireEvent.dragStart(card("Aziz Karimov"), { dataTransfer });
    fireEvent.dragOver(closedColumn, { dataTransfer });
    fireEvent.drop(closedColumn, { dataTransfer });

    expect(statCard(/closed/i)).toHaveTextContent("4");
    expect(statCard(/lead/i)).toHaveTextContent("4");
  });

  it("opens the edit form from a card via its own button (keyboard accessible)", async () => {
    const { user } = setup();
    await openKanban(user);
    await user.click(within(card("Aziz Karimov")).getByRole("button", { name: "Редактировать Aziz Karimov" }));
    const dialog = screen.getByRole("dialog", { name: "Редактировать клиента" });
    expect(within(dialog).getByLabelText(/имя/i)).toHaveValue("Aziz Karimov");
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("does not render an empty company row for clients without a company (regression)", async () => {
    const { user } = setup();
    await openKanban(user);
    expect(card("Sardor Nazarov").querySelector('[class*="lucide-building"]')).toBeNull();
    expect(card("Aziz Karimov").querySelector('[class*="lucide-building"]')).not.toBeNull();
  });
});

describe("theme", () => {
  it("starts light, toggles to dark and remembers the choice", async () => {
    const { user } = setup();
    expect(document.documentElement).not.toHaveClass("dark");

    await user.click(screen.getByRole("button", { name: "Включить тёмную тему" }));
    expect(document.documentElement).toHaveClass("dark");
    expect(localStorage.getItem("crm-mini-theme")).toBe("dark");
    expect(screen.getByRole("button", { name: "Включить светлую тему" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Включить светлую тему" }));
    expect(document.documentElement).not.toHaveClass("dark");
    expect(localStorage.getItem("crm-mini-theme")).toBe("light");
  });

  it("restores a saved dark theme after a reload", () => {
    localStorage.setItem("crm-mini-theme", "dark");
    setup();
    expect(document.documentElement).toHaveClass("dark");
  });

  it("follows the system preference when nothing is saved", () => {
    const original = window.matchMedia;
    window.matchMedia = ((q: string) => ({ matches: q.includes("dark"), media: q })) as typeof window.matchMedia;
    try {
      setup();
      expect(document.documentElement).toHaveClass("dark");
    } finally {
      window.matchMedia = original;
    }
  });

  it("prefers the saved choice over the system preference", () => {
    const original = window.matchMedia;
    window.matchMedia = ((q: string) => ({ matches: q.includes("dark"), media: q })) as typeof window.matchMedia;
    localStorage.setItem("crm-mini-theme", "light");
    try {
      setup();
      expect(document.documentElement).not.toHaveClass("dark");
    } finally {
      window.matchMedia = original;
    }
  });
});

describe("robustness and persistence", () => {
  it("does not crash on an unknown status from localStorage (regression)", () => {
    const [first] = seedClients();
    localStorage.setItem(STORAGE_KEY, JSON.stringify([{ ...first, status: "weird" }]));
    setup();
    expect(within(screen.getByRole("table")).getByText("weird")).toBeInTheDocument();
  });

  it("shows a dash for clients without a company in the table (regression)", () => {
    const [first] = seedClients();
    localStorage.setItem(STORAGE_KEY, JSON.stringify([{ ...first, company: "" }]));
    setup();
    expect(cell(tableRows()[0], 2)).toBe("—");
  });

  it("restores data after a reload", async () => {
    const first = setup();
    await first.user.click(screen.getByRole("button", { name: "Удалить Aziz Karimov" }));
    await first.user.click(within(screen.getByRole("alertdialog")).getByRole("button", { name: "Удалить" }));
    first.unmount();

    render(<App />);
    expect(screen.getByText(/13 записей/)).toBeInTheDocument();
  });
});

describe("corrupted storage", () => {
  it("skips broken saved clients instead of crashing on search", async () => {
    const [good] = seedClients();
    localStorage.setItem(STORAGE_KEY, JSON.stringify([good, { id: "CL-050", status: "lead" }]));
    const { user } = setup();
    expect(screen.getByText(/1 записей/)).toBeInTheDocument();
    await user.type(screen.getByLabelText("Поиск клиентов"), "a");
    await waitFor(() => expect(tableRows()).toHaveLength(1));
    expect(cell(tableRows()[0], 1)).toBe(good.name);
  });
});
