import type { Client, StatusKey } from "../types";

/** Номер из id формата CL-N; NaN, если формат другой */
export function idNumber(id: string): number {
  const match = /^CL-(\d+)$/.exec(id);
  return match ? Number(match[1]) : NaN;
}

/**
 * Следующий id: max(номер среди клиентов, последний выданный номер) + 1.
 * lastIssued не даёт повторно выдать id удалённого клиента.
 */
export function nextId(clients: Pick<Client, "id">[], lastIssued = 0): string {
  const nums = clients.map((c) => idNumber(c.id)).filter((n) => !isNaN(n));
  const max = Math.max(lastIssued, ...nums, 0);
  return `CL-${String(max + 1).padStart(3, "0")}`;
}

const DAY = 86400000;

export function seedClients(): Client[] {
  const now = Date.now();
  const rows: [string, string, string, string, StatusKey, number][] = [
    ["Aziz Karimov", "TechSoft LLC", "aziz@techsoft.uz", "+998 90 123 45 67", "lead", 6],
    ["Dilnoza Yusupova", "BrightMedia", "dilnoza@brightmedia.uz", "+998 91 234 56 78", "active", 4],
    ["Sardor Nazarov", "—", "sardor.n@gmail.com", "+998 93 345 67 89", "active", 2],
    ["Malika Tosheva", "UzInvest Group", "malika@uzinvest.uz", "+998 94 456 78 90", "closed", 9],
    ["Bobur Rahimov", "SilkRoad Travel", "bobur@silkroad.uz", "+998 97 567 89 01", "lead", 1],
    ["Nodira Abdullaeva", "Samarkand Foods", "nodira@samfoods.uz", "+998 90 678 90 12", "active", 12],
    ["Jasur Ismoilov", "DataBridge", "jasur@databridge.io", "+998 99 789 01 23", "lead", 3],
    ["Gulnora Saidova", "—", "gulnora.s@mail.ru", "+998 91 890 12 34", "closed", 15],
    ["Otabek Mirzaev", "Chirchiq Metal", "otabek@chmetal.uz", "+998 93 901 23 45", "active", 7],
    ["Zarina Qodirova", "PixelCraft Studio", "zarina@pixelcraft.uz", "+998 94 012 34 56", "lead", 0],
    ["Rustam Aliev", "Tashkent Logistics", "rustam@tashlog.uz", "+998 97 111 22 33", "active", 20],
    ["Madina Ergasheva", "EduPro Academy", "madina@edupro.uz", "+998 90 222 33 44", "closed", 25],
    ["Timur Xasanov", "GreenField Agro", "timur@greenfield.uz", "+998 91 333 44 55", "lead", 5],
    ["Shahlo Umarova", "—", "shahlo.u@gmail.com", "+998 93 444 55 66", "active", 8],
  ];
  return rows.map(([name, company, email, phone, status, daysAgo], i) => ({
    id: `CL-${String(i + 1).padStart(3, "0")}`,
    name,
    company,
    email,
    phone,
    status,
    createdAt: now - DAY * daysAgo,
  }));
}
