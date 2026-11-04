import { describe, it, expect } from "vitest";
import type { Client, SortState } from "../types";
import { nextSortState } from "@/store/clientFiltersStore";
import { clientsToCsv, csvFileName } from "./exportClients";
import { filterClients, hasCompany } from "./filterClients";
import { sortClients } from "./sortClients";

const make = (over: Partial<Client> & Pick<Client, "id">): Client => ({
  name: "n",
  company: "c",
  email: "e@example.com",
  phone: "+1 415 555 0100",
  status: "lead",
  createdAt: 0,
  ...over,
});

const clients: Client[] = [
  make({ id: "1", name: "b", company: "", status: "closed", createdAt: 3, email: "b@zeta.io" }),
  make({ id: "2", name: "a", company: "Zeta", status: "lead", createdAt: 1, email: "a@zeta.io" }),
  make({ id: "3", name: "c", company: "Alpha", status: "active", createdAt: 2, email: "c@alpha.io" }),
];

const ids = (list: Client[]) => list.map((c) => c.id).join(",");
const by = (key: SortState["key"], dir: SortState["dir"]) => ids(sortClients(clients, { key, dir }));

describe("sortClients", () => {
  it("sorts by name ascending and descending", () => {
    expect(by("name", "asc")).toBe("2,1,3");
    expect(by("name", "desc")).toBe("3,1,2");
  });

  it("puts clients without a company last, in both directions", () => {
    expect(by("company", "asc")).toBe("3,2,1");
    expect(by("company", "desc")).toBe("2,3,1");
  });

  it("sorts status by pipeline order (lead → active → closed)", () => {
    expect(by("status", "asc")).toBe("2,3,1");
    expect(by("status", "desc")).toBe("1,3,2");
  });

  it("sorts by date added", () => {
    expect(by("createdAt", "asc")).toBe("2,3,1");
  });

  it("returns the original order without a sort key and never mutates the input", () => {
    const copy = [...clients];
    expect(by(null, "asc")).toBe("1,2,3");
    sortClients(clients, { key: "name", dir: "asc" });
    expect(clients).toEqual(copy);
  });

  it("compares accented names naturally", () => {
    const list = [
      make({ id: "x", name: "Émile" }),
      make({ id: "y", name: "Eva" }),
      make({ id: "z", name: "Ana" }),
    ];
    expect(ids(sortClients(list, { key: "name", dir: "asc" }))).toBe("z,x,y");
  });
});

describe("nextSortState (column header clicks)", () => {
  it("cycles asc → desc → off, and starts over on another column", () => {
    const asc = nextSortState({ key: null, dir: "asc" }, "name");
    expect(asc).toEqual({ key: "name", dir: "asc" });
    const desc = nextSortState(asc, "name");
    expect(desc).toEqual({ key: "name", dir: "desc" });
    expect(nextSortState(desc, "name")).toEqual({ key: null, dir: "asc" });
    expect(nextSortState(desc, "email")).toEqual({ key: "email", dir: "asc" });
  });
});

describe("filterClients", () => {
  it("searches name, company and email, ignoring case and surrounding spaces", () => {
    expect(ids(filterClients(clients, "  ZETA ", "all"))).toBe("1,2");
    expect(ids(filterClients(clients, "alpha", "all"))).toBe("3");
    expect(ids(filterClients(clients, "A", "all"))).toBe("1,2,3");
  });

  it("combines search with a status filter", () => {
    expect(ids(filterClients(clients, "zeta", "lead"))).toBe("2");
    expect(ids(filterClients(clients, "", "active"))).toBe("3");
  });

  it("knows when a client has a company", () => {
    expect(hasCompany({ company: "  " })).toBe(false);
    expect(hasCompany({ company: "Acme" })).toBe(true);
  });
});

describe("CSV export", () => {
  it("exports the given clients with readable status and ISO dates", () => {
    const csv = clientsToCsv([
      make({
        id: "CL-007",
        name: "Smith, Jane",
        company: "",
        status: "active",
        createdAt: Date.UTC(2026, 0, 2),
        phone: "+44 20 7946 0123",
      }),
    ]);
    const [header, row] = csv.split("\r\n");
    expect(header).toBe("ID,Name,Company,Email,Phone,Status,Date added");
    expect(row).toBe('CL-007,"Smith, Jane",,e@example.com,+44 20 7946 0123,Active,2026-01-02');
  });

  it("names the file after the day", () => {
    expect(csvFileName(Date.UTC(2026, 10, 3))).toBe("clients-2026-11-03.csv");
  });
});
