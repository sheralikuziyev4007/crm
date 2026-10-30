// Номера страниц для пагинатора: первая, последняя, текущая ±1, между ними «…»
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
