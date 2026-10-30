import { describe, it, expect } from "vitest";
import type { Client, SortState } from "../types";
import { sortClients, nextSortState } from "./sortClients";

const make = (over: Partial<Client> & Pick<Client, "id">): Client => ({
  name: "n",
  company: "c",
  email: "e@e.uz",
  phone: "+998 90 000 00 00",
  status: "lead",
  createdAt: 0,
  ...over,
});

const clients: Client[] = [
  make({ id: "1", name: "b", company: "", status: "closed", createdAt: 3 }),
  make({ id: "2", name: "a", company: "Zeta", status: "lead", createdAt: 1 }),
  make({ id: "3", name: "c", company: "Alpha", status: "active", createdAt: 2 }),
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

  it("treats the legacy '—' placeholder as an empty company", () => {
    const list = [make({ id: "x", company: "—" }), make({ id: "y", company: "Acme" })];
    expect(ids(sortClients(list, { key: "company", dir: "asc" }))).toBe("y,x");
  });

  it("sorts status by pipeline order (lead → active → closed)", () => {
    expect(by("status", "asc")).toBe("2,3,1");
  });

  it("sorts by creation date", () => {
    expect(by("createdAt", "desc")).toBe("1,3,2");
    expect(by("createdAt", "asc")).toBe("2,3,1");
  });

  it("returns the same array when no sort key is set", () => {
    expect(sortClients(clients, { key: null, dir: "asc" })).toBe(clients);
  });

  it("does not mutate the input array", () => {
    const before = ids(clients);
    sortClients(clients, { key: "name", dir: "desc" });
    expect(ids(clients)).toBe(before);
  });

  it("is stable: equal items keep their original order", () => {
    const same = [make({ id: "1", name: "x" }), make({ id: "2", name: "x" }), make({ id: "3", name: "x" })];
    expect(ids(sortClients(same, { key: "name", dir: "desc" }))).toBe("1,2,3");
  });

  it("handles records saved before createdAt existed", () => {
    const old = [make({ id: "a", createdAt: 5 }), { ...make({ id: "b" }), createdAt: undefined as unknown as number }];
    expect(ids(sortClients(old, { key: "createdAt", dir: "asc" }))).toBe("b,a");
  });
});

describe("nextSortState", () => {
  it("cycles asc → desc → none for the same column", () => {
    const s1 = nextSortState({ key: null, dir: "asc" }, "name");
    expect(s1).toEqual({ key: "name", dir: "asc" });
    const s2 = nextSortState(s1, "name");
    expect(s2).toEqual({ key: "name", dir: "desc" });
    expect(nextSortState(s2, "name")).toEqual({ key: null, dir: "asc" });
  });

  it("starts ascending when another column is chosen", () => {
    expect(nextSortState({ key: "name", dir: "desc" }, "email")).toEqual({ key: "email", dir: "asc" });
  });
});
