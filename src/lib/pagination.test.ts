import { describe, it, expect } from "vitest";
import { getPageItems, paginate } from "./pagination";

describe("getPageItems", () => {
  it("returns every page when there are only a few", () => {
    expect(getPageItems(1, 1)).toEqual([1]);
    expect(getPageItems(1, 3)).toEqual([1, 2, 3]);
  });

  it("collapses the middle with ellipses", () => {
    expect(getPageItems(5, 10)).toEqual([1, "…", 4, 5, 6, "…", 10]);
  });

  it("collapses only one side near the edges", () => {
    expect(getPageItems(1, 10)).toEqual([1, 2, "…", 10]);
    expect(getPageItems(10, 10)).toEqual([1, "…", 9, 10]);
  });

  it("does not insert an ellipsis for a gap of a single page", () => {
    expect(getPageItems(3, 5)).toEqual([1, 2, 3, 4, 5]);
  });
});

describe("paginate", () => {
  const items = Array.from({ length: 23 }, (_, i) => i + 1);

  it("returns the requested page", () => {
    const { currentPage, totalPages, pageItems } = paginate(items, 2, 10);
    expect({ currentPage, totalPages }).toEqual({ currentPage: 2, totalPages: 3 });
    expect(pageItems).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
  });

  it("clamps a page that no longer exists (e.g. after a delete)", () => {
    expect(paginate(items, 9, 10).currentPage).toBe(3);
    expect(paginate(items, 0, 10).currentPage).toBe(1);
  });

  it("handles an empty list", () => {
    expect(paginate([], 3, 10)).toEqual({ currentPage: 1, totalPages: 1, pageItems: [] });
  });
});
