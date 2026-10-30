import { describe, it, expect } from "vitest";
import { parseClients } from "./parseClients";
import { seedClients } from "./idGenerator";

describe("parseClients", () => {
  it("accepts valid data unchanged", () => {
    const seed = seedClients();
    expect(parseClients(JSON.parse(JSON.stringify(seed)))).toEqual(seed);
  });

  it("drops only the broken entries", () => {
    const [good] = seedClients();
    const raw = [
      good,
      { id: "CL-900", status: "lead" }, // нет имени и email
      { ...good, id: "CL-901", status: 5 }, // статус не строка
      { ...good, id: "", name: "Без id" },
      null,
      "text",
    ];
    expect(parseClients(raw)).toEqual([good]);
  });

  it("keeps a client with an unknown status (shown via getStatus)", () => {
    const [good] = seedClients();
    expect(parseClients([{ ...good, status: "vip" }])).toEqual([{ ...good, status: "vip" }]);
  });

  it("fills optional fields with defaults", () => {
    expect(parseClients([{ id: "CL-001", name: "Ali", email: "a@b.uz", status: "active" }])).toEqual([
      { id: "CL-001", name: "Ali", email: "a@b.uz", company: "", phone: "", status: "active", createdAt: 0 },
    ]);
  });

  it.each([
    ["not an array", { a: 1 }],
    ["null", null],
    ["every entry broken", [{ id: "CL-1" }, 42]],
  ])("rejects unusable data: %s", (_label, raw) => {
    expect(parseClients(raw)).toBeNull();
  });

  it("keeps an intentionally empty list", () => {
    expect(parseClients([])).toEqual([]);
  });
});
