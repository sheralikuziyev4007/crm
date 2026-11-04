import { describe, it, expect } from "vitest";
import { isValidPhone, normalizePhone, telHref } from "./phone";

describe("isValidPhone", () => {
  it.each([
    "+1 415 555 0132",
    "+44 20 7946 0123",
    "+998 90 123 45 67",
    "+49 (30) 901820-41",
    "+971 4 555 0198",
    "+1.415.555.0132",
  ])("accepts %s", (value) => expect(isValidPhone(value)).toBe(true));

  it.each([
    ["no country code", "415 555 0132"],
    ["letters", "+1 415 CALL NOW"],
    ["too short", "+1 234"],
    ["too long (more than 15 digits)", "+1 234 567 890 123 456"],
    ["country code starting with 0", "+0 415 555 0132"],
    ["a plus sign in the middle", "+1 415+555 0132"],
    ["empty", ""],
  ])("rejects %s", (_label, value) => expect(isValidPhone(value)).toBe(false));
});

describe("normalizePhone", () => {
  it("collapses whitespace without touching the digits", () => {
    expect(normalizePhone("  +44   20 7946    0123 ")).toBe("+44 20 7946 0123");
    expect(normalizePhone("+ 1 415 555 0132")).toBe("+1 415 555 0132");
  });
});

describe("telHref", () => {
  it("keeps only the digits", () => {
    expect(telHref("+1 (415) 555-0132")).toBe("tel:+14155550132");
  });
});
