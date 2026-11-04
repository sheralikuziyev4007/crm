// Page numbers for the paginator: first, last, current ±1, with "…" in between
export function getPageItems(page: number, totalPages: number): (number | "…")[] {
  const nums = [...new Set([1, totalPages, page - 1, page, page + 1])]
    .filter((n) => n >= 1 && n <= totalPages)
    .sort((a, b) => a - b);

  const items: (number | "…")[] = [];
  nums.forEach((n, i) => {
    if (i > 0 && n - nums[i - 1] > 1) items.push("…");
    items.push(n);
  });
  return items;
}

export function paginate<T>(items: T[], page: number, pageSize: number) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  // The page may disappear after a delete or a filter change, so clamp it
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const pageItems = items.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  return { currentPage, totalPages, pageItems };
}
