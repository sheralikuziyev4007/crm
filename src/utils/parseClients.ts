import type { Client, StatusKey } from "../types";

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null;
const isText = (v: unknown): v is string => typeof v === "string" && v.trim() !== "";

/**
 * Проверяет клиентов, прочитанных из localStorage.
 * Битые записи (нет id / имени / email) отбрасываются по одной,
 * необязательные поля получают значения по умолчанию.
 * Неизвестный статус сохраняется как есть — UI показывает его через getStatus(), данные клиента не теряются.
 * null — данные непригодны целиком (не массив или все записи битые): тогда берутся демо-данные.
 * Намеренно пустой список ([]) сохраняется.
 */
export function parseClients(raw: unknown): Client[] | null {
  if (!Array.isArray(raw)) return null;

  const result: Client[] = [];
  for (const entry of raw) {
    if (!isRecord(entry) || !isText(entry.id) || !isText(entry.name) || !isText(entry.email)) continue;
    if (typeof entry.status !== "string") continue;

    result.push({
      id: entry.id,
      name: entry.name,
      email: entry.email,
      company: typeof entry.company === "string" ? entry.company : "",
      phone: typeof entry.phone === "string" ? entry.phone : "",
      status: entry.status as StatusKey,
      createdAt: typeof entry.createdAt === "number" && Number.isFinite(entry.createdAt) ? entry.createdAt : 0,
    });
  }
  return raw.length > 0 && result.length === 0 ? null : result;
}
