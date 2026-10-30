import { describe, it, expect } from "vitest";
import { nextId, seedClients } from "./idGenerator";

describe("nextId", () => {
  it("starts at CL-001 for an empty list", () => {
    expect(nextId([])).toBe("CL-001");
  });

  it("uses max + 1, even with gaps", () => {
    expect(nextId([{ id: "CL-001" }, { id: "CL-007" }, { id: "CL-003" }])).toBe("CL-008");
  });

  it("ignores ids that do not match the CL-N format", () => {
    expect(nextId([{ id: "legacy" }, { id: "CL-002" }, { id: "CL-5x" }])).toBe("CL-003");
  });

  it("never goes below the last issued number", () => {
    expect(nextId([{ id: "CL-002" }], 14)).toBe("CL-015");
    expect(nextId([{ id: "CL-020" }], 14)).toBe("CL-021");
    expect(nextId([], 3)).toBe("CL-004");
  });
});

describe("seedClients", () => {
  it("creates unique ids and valid statuses", () => {
    const seed = seedClients();
    expect(new Set(seed.map((c) => c.id)).size).toBe(seed.length);
    expect(seed.every((c) => ["lead", "active", "closed"].includes(c.status))).toBe(true);
  });

  it("is large enough to demonstrate pagination (more than 10)", () => {
    expect(seedClients().length).toBeGreaterThan(10);
  });
});
