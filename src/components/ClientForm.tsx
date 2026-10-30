import { useId, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import type { Client, ClientFields } from "../types";
import { STATUSES } from "../utils/constants";
import { validate } from "../utils/validation";
import { formatUzPhone } from "../utils/formatPhone";
import Modal from "./Modal";
import FormField from "./FormField";

const EMPTY: ClientFields = { name: "", company: "", email: "", phone: "", status: "lead" };
const FIELD_ORDER = ["name", "email", "phone"] as const;
type FieldKey = (typeof FIELD_ORDER)[number];

// В форму попадают только редактируемые поля — без id и createdAt
const toFields = (client: Client | null): ClientFields =>
  client
    ? {
        name: client.name,
        company: client.company ?? "",
        email: client.email,
        phone: client.phone,
        status: client.status,
      }
    : EMPTY;

const inputClass = (hasError: boolean) =>
  `mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-brand-600 ${
    hasError ? "border-rose-400" : "border-stone-300"
  }`;

interface ClientFormProps {
  initial: Client | null;
  onCancel: () => void;
  onSave: (fields: ClientFields) => void;
}

export default function ClientForm({ initial, onCancel, onSave }: ClientFormProps) {
  const [initialFields] = useState(() => toFields(initial));
  const [fields, setFields] = useState<ClientFields>(initialFields);
  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>({});
  const formRef = useRef<HTMLFormElement>(null);
  const statusLabelId = useId();

  const errors = validate(fields);
  const show = (key: FieldKey) => (touched[key] ? errors[key] : undefined);
  const dirty = JSON.stringify(fields) !== JSON.stringify(initialFields);

  const handleBlur = (key: FieldKey) => setTouched((t) => ({ ...t, [key]: true }));
  const handleChange = (key: keyof ClientFields) => (e: ChangeEvent<HTMLInputElement>) => {
    const value = key === "phone" ? formatUzPhone(e.target.value) : e.target.value;
    setFields((f) => ({ ...f, [key]: value }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTouched({ name: true, email: true, phone: true });

    // Кнопка «Сохранить» всегда активна: при ошибках показываем их и ставим фокус на первое проблемное поле
    const firstInvalid = FIELD_ORDER.find((key) => errors[key]);
    if (firstInvalid) {
      (formRef.current?.elements.namedItem(firstInvalid) as HTMLElement | null)?.focus();
      return;
    }

    onSave({
      ...fields,
      name: fields.name.trim(),
      company: fields.company.trim(),
      email: fields.email.trim(),
    });
  };

  return (
    <Modal
      title={initial ? "Редактировать клиента" : "Новый клиент"}
      onClose={onCancel}
      // Не закрываем по клику на подложку, если пользователь уже что-то ввёл — чтобы не потерять данные
      closeOnOverlayClick={!dirty}
    >
      <form ref={formRef} onSubmit={handleSubmit} noValidate>
        <div className="px-5 py-4 space-y-4">
          <FormField label="Имя" required error={show("name")}>
            <input
              data-autofocus
              name="name"
              autoComplete="off"
              value={fields.name}
              onChange={handleChange("name")}
              onBlur={() => handleBlur("name")}
              className={inputClass(!!show("name"))}
              placeholder="Иван Петров"
            />
          </FormField>

          <FormField label="Компания">
            <input
              name="company"
              autoComplete="off"
              value={fields.company}
              onChange={handleChange("company")}
              className={inputClass(false)}
              placeholder="Название компании (необязательно)"
            />
          </FormField>

          <FormField label="Email" required error={show("email")}>
            <input
              name="email"
              type="email"
              inputMode="email"
              autoComplete="off"
              value={fields.email}
              onChange={handleChange("email")}
              onBlur={() => handleBlur("email")}
              className={inputClass(!!show("email"))}
              placeholder="client@example.com"
            />
          </FormField>

          <FormField label="Телефон" required error={show("phone")}>
            <input
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="off"
              value={fields.phone}
              onChange={handleChange("phone")}
              onBlur={() => handleBlur("phone")}
              className={inputClass(!!show("phone"))}
              placeholder="+998 90 123 45 67"
              maxLength={17}
            />
          </FormField>

          <div role="group" aria-labelledby={statusLabelId}>
            <span id={statusLabelId} className="text-xs font-medium text-stone-500 uppercase tracking-wide">
              Статус
            </span>
            <div className="mt-1 flex gap-2">
              {STATUSES.map((s) => {
                const selected = fields.status === s.key;
                return (
                  <button
                    key={s.key}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setFields((f) => ({ ...f, status: s.key }))}
                    style={{
                      backgroundColor: selected ? s.bg : "rgb(var(--surface))",
                      color: selected ? s.color : "rgb(var(--stone-500))",
                      borderColor: selected ? s.dot : "rgb(var(--stone-300))",
                    }}
                    className="flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-stone-100 px-5 py-4">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 transition-colors"
          >
            Отмена
          </button>
          <button
            type="submit"
            className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white hover:bg-brand-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 transition-colors"
          >
            Сохранить
          </button>
        </div>
      </form>
    </Modal>
  );
}
