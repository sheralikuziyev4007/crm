import { describe, it, expect } from "vitest";
import { hasCompany, companyLabel } from "./company";

describe("company helpers", () => {
  it("treats empty, whitespace, missing and '—' as no company", () => {
    expect(hasCompany({ company: "" })).toBe(false);
    expect(hasCompany({ company: "   " })).toBe(false);
    expect(hasCompany({ company: "—" })).toBe(false);
    expect(hasCompany({})).toBe(false);
    expect(hasCompany(null)).toBe(false);
  });

  it("recognises a real company and trims it", () => {
    expect(hasCompany({ company: "Acme" })).toBe(true);
    expect(companyLabel({ company: "  Acme  " })).toBe("Acme");
  });

  it("falls back to a dash for display", () => {
    expect(companyLabel({ company: "" })).toBe("—");
  });
});
