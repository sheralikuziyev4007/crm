export const EMPTY_COMPANY = "—";

// Компания считается заполненной, если это не пустая строка и не плейсхолдер "—"
export const hasCompany = (client?: { company?: string | null } | null): boolean => {
  const value = (client?.company ?? "").trim();
  return value !== "" && value !== EMPTY_COMPANY;
};

export const companyLabel = (client: { company?: string | null }): string => (hasCompany(client) ? client.company!.trim() : EMPTY_COMPANY);
