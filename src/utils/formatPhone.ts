// Форматирует ввод в узбекский формат телефона: +998 XX XXX XX XX
export function formatUzPhone(value: string): string {
  let digits = value.replace(/\D/g, "");

  // Если пользователь начал с "998" — считаем это кодом страны
  if (digits.startsWith("998")) {
    digits = digits.slice(3);
  }

  digits = digits.slice(0, 9); // XX XXX XX XX = 9 цифр

  let out = "+998";
  if (digits.length > 0) out += " " + digits.slice(0, 2);
  if (digits.length > 2) out += " " + digits.slice(2, 5);
  if (digits.length > 5) out += " " + digits.slice(5, 7);
  if (digits.length > 7) out += " " + digits.slice(7, 9);

  return out;
}
