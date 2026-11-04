import { describe, it, expect } from "vitest";
import type { Client } from "@/features/clients/types";
import { DAY_MS } from "@/lib/constants";
import { countByStatus, newClientsPerWeek } from "./stats";
import { niceTicks } from "./ticks";

const NOW = Date.UTC(2026, 10, 3, 12);
const client = (daysAgo: number, status: Client["status"] = "lead"): Client => ({
  id: `CL-${daysAgo}`,
  name: "n",
  company: "",
  email: `${daysAgo}@x.io`,
  phone: "+1 415 555 0100",
  status,
  createdAt: NOW - daysAgo * DAY_MS,
});

describe("countByStatus", () => {
  it("counts every stage, including empty ones", () => {
    expect(countByStatus([client(1), client(2, "active"), client(3, "lead")])).toEqual({
      lead: 2,
      active: 1,
      closed: 0,
    });
  });
});

describe("newClientsPerWeek", () => {
  it("buckets clients into 7-day windows ending now, oldest first", () => {
    const weeks = newClientsPerWeek([client(0), client(6), client(7), client(20), client(60)], 4, NOW);
    // day 0 and 6 → this week, 7 → last week, 20 → three weeks ago, 60 → outside the window
    expect(weeks.map((w) => w.count)).toEqual([0, 1, 1, 2]);
    expect(weeks).toHaveLength(4);
  });
});

describe("niceTicks", () => {
  it.each([
    [1, [0, 1]],
    [3, [0, 1, 2, 3]],
    [7, [0, 2, 4, 6, 8]],
    [11, [0, 5, 10, 15]],
    [40, [0, 10, 20, 30, 40]],
  ])("max %i → %o", (max, ticks) => {
    expect(niceTicks(max)).toEqual(ticks);
  });
});
