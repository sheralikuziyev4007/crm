import { describe, it, expect } from "vitest";
import { formatUzPhone } from "./formatPhone";

describe("formatUzPhone", () => {
  it("formats a full local number", () => {
    expect(formatUzPhone("901234567")).toBe("+998 90 123 45 67");
  });

  it("recognises a leading country code", () => {
    expect(formatUzPhone("998901234567")).toBe("+998 90 123 45 67");
    expect(formatUzPhone("+998 90 123 45 67")).toBe("+998 90 123 45 67");
  });

  it("formats progressively while typing", () => {
    expect(formatUzPhone("")).toBe("+998");
    expect(formatUzPhone("9")).toBe("+998 9");
    expect(formatUzPhone("901")).toBe("+998 90 1");
    expect(formatUzPhone("9012345")).toBe("+998 90 123 45");
  });

  it("ignores letters and punctuation, and truncates extra digits", () => {
    expect(formatUzPhone("(90) 123-45-67 ext")).toBe("+998 90 123 45 67");
    expect(formatUzPhone("90123456789999")).toBe("+998 90 123 45 67");
  });

  it("is idempotent", () => {
    const once = formatUzPhone("901234567");
    expect(formatUzPhone(once)).toBe(once);
  });
});
