import type { ClientFields, FormErrors } from "../types";

export function validate(fields: Partial<Pick<ClientFields, "name" | "email" | "phone">>): FormErrors {
  const errors: FormErrors = {};

  if (!fields.name || fields.name.trim().length < 2) {
    errors.name = "Имя должно содержать минимум 2 символа";
  }

  // trim: мобильные клавиатуры часто добавляют пробел после автоподстановки
  const email = (fields.email || "").trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Введите корректный email";
  }

  // Должно быть ровно 9 цифр после кода страны +998
  const phoneDigits = (fields.phone || "").replace(/\D/g, "").replace(/^998/, "");
  if (phoneDigits.length !== 9) {
    errors.phone = "Введите корректный номер телефона";
  }

  return errors;
}
