import { describe, it, expect, vi, afterEach } from "vitest";
import { downloadCsv, escapeCsvCell, toCsv } from "./csv";

describe("escapeCsvCell", () => {
  it("leaves plain values alone", () => {
    expect(escapeCsvCell("Olivia Bennett")).toBe("Olivia Bennett");
    expect(escapeCsvCell(42)).toBe("42");
  });

  it("quotes commas, quotes and line breaks (RFC 4180)", () => {
    expect(escapeCsvCell("Harbour, Finch")).toBe('"Harbour, Finch"');
    expect(escapeCsvCell('The "best" co')).toBe('"The ""best"" co"');
    expect(escapeCsvCell("line\nbreak")).toBe('"line\nbreak"');
  });

  it("neutralises cells that a spreadsheet would run as a formula", () => {
    expect(escapeCsvCell('=HYPERLINK("http://evil")')).toBe(`"'=HYPERLINK(""http://evil"")"`);
    expect(escapeCsvCell("@SUM(A1)")).toBe("'@SUM(A1)");
    expect(escapeCsvCell("-2+3")).toBe("'-2+3");
  });

  it("does not mangle international phone numbers", () => {
    expect(escapeCsvCell("+1 415 555 0132")).toBe("+1 415 555 0132");
    expect(escapeCsvCell("+49 (30) 901820-41")).toBe("+49 (30) 901820-41");
  });
});

describe("toCsv", () => {
  it("writes a header row and one line per row, CRLF separated", () => {
    const csv = toCsv(
      [
        { name: "A", city: "Paris" },
        { name: "B, Jr.", city: "" },
      ],
      [
        { key: "name", label: "Name" },
        { key: "city", label: "City" },
      ],
    );
    expect(csv).toBe('Name,City\r\nA,Paris\r\n"B, Jr.",');
  });
});

describe("downloadCsv", () => {
  afterEach(() => vi.restoreAllMocks());

  it("downloads a UTF-8 file with a BOM and cleans up the object URL", async () => {
    let blob: Blob | undefined;
    const create = vi.fn((b: Blob) => {
      blob = b;
      return "blob:csv";
    });
    const revoke = vi.fn();
    Object.assign(URL, { createObjectURL: create, revokeObjectURL: revoke });
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

    downloadCsv("clients.csv", "a,b");

    expect(click).toHaveBeenCalledOnce();
    expect(revoke).toHaveBeenCalledWith("blob:csv");
    expect(blob?.type).toBe("text/csv;charset=utf-8");
    const buffer = await new Promise<ArrayBuffer>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.readAsArrayBuffer(blob!);
    });
    const bytes = new Uint8Array(buffer);
    expect([...bytes.slice(0, 3)]).toEqual([0xef, 0xbb, 0xbf]);
    expect(document.querySelector("a[download]")).toBeNull();
  });
});
