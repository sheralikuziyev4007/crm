import { describe, it, expect } from "vitest";
import { getPageItems } from "./pagination";

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
