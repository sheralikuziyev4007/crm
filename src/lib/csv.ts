// CSV helpers: RFC 4180 quoting, a guard against spreadsheet formula injection, and a browser download.

export type CsvRow = Record<string, string | number>;

// A cell that starts like a formula (=SUM(...), @cmd, -1+1...) is executed by Excel / Google Sheets.
// Phone numbers ("+1 415 555 0132") are left alone: a "+" followed only by digits and separators is safe.
const FORMULA_START = /^[=@\t\r]|^[+-](?![\d\s().-]*$)/;

export function escapeCsvCell(value: string | number): string {
  let text = String(value);
  if (FORMULA_START.test(text)) text = `'${text}`;
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv(rows: CsvRow[], columns: { key: string; label: string }[]): string {
  const header = columns.map((c) => escapeCsvCell(c.label)).join(",");
  const lines = rows.map((row) => columns.map((c) => escapeCsvCell(row[c.key] ?? "")).join(","));
  return [header, ...lines].join("\r\n");
}

/** Starts a download. The BOM makes Excel read non-ASCII names (é, ü, ş) correctly. */
export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob(["﻿", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
