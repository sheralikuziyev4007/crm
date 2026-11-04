import { describe, it, expect } from "vitest";
import { formatDate, formatRelative, isoDate } from "./date";

const NOW = Date.UTC(2026, 9, 15, 12, 0, 0);
const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;

describe("formatRelative", () => {
  it.each([
    [NOW - 10_000, "just now"],
    [NOW - 5 * MINUTE, "5 minutes ago"],
    [NOW - 3 * 60 * MINUTE, "3 hours ago"],
    [NOW - DAY, "yesterday"],
    [NOW - 3 * DAY, "3 days ago"],
    [NOW - 14 * DAY, "2 weeks ago"],
    [NOW - 70 * DAY, "2 months ago"],
    [NOW + 2 * DAY, "in 2 days"],
  ])("formats %s as %s", (timestamp, expected) => {
    expect(formatRelative(timestamp, NOW)).toBe(expected);
  });
});

describe("formatDate / isoDate", () => {
  it("formats for people and for machines", () => {
    expect(formatDate(NOW)).toBe("Oct 15, 2026");
    expect(isoDate(NOW)).toBe("2026-10-15");
  });
});
