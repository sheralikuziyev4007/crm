import { useEffect, useId, useRef, type KeyboardEvent, type ReactNode } from "react";
import { X } from "lucide-react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const SIZES: Record<"sm" | "md", string> = { sm: "max-w-sm", md: "max-w-md" };

/**
 * Доступная модалка:
 * - role="dialog" / "alertdialog", aria-modal, aria-labelledby, aria-describedby
 * - закрытие по Escape и клику на подложку (отключается через closeOnOverlayClick)
 * - фокус уходит внутрь, «запирается» на Tab / Shift+Tab и возвращается на кнопку-открывашку
 * - блокировка прокрутки страницы под модалкой
 * Элемент с атрибутом data-autofocus получает фокус первым.
 */
interface ModalProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  role?: "dialog" | "alertdialog";
  describedBy?: string;
  closeOnOverlayClick?: boolean;
  size?: "sm" | "md";
}

export default function Modal({
  title,
  onClose,
  children,
  role = "dialog",
  describedBy,
  closeOnOverlayClick = true,
  size = "md",
}: ModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  // Всегда актуальный onClose без перезапуска эффекта при каждом рендере родителя
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const previouslyFocused = document.activeElement;
    const panel = panelRef.current!;
    (panel.querySelector<HTMLElement>("[data-autofocus]") ?? panel.querySelector<HTMLElement>(FOCUSABLE) ?? panel).focus();

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
      if (previouslyFocused instanceof HTMLElement && document.contains(previouslyFocused)) {
        previouslyFocused.focus();
      }
    };
  }, []);

  const trapFocus = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab") return;
    const panel = panelRef.current!;
    const items = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)];
    if (items.length === 0) {
      e.preventDefault();
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;
    if (e.shiftKey && (active === first || active === panel)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onMouseDown={(e) => {
        if (closeOnOverlayClick && e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role={role}
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={describedBy}
        tabIndex={-1}
        onKeyDown={trapFocus}
        className={`w-full ${SIZES[size]} max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-2xl border border-stone-200 bg-surface shadow-2xl outline-none`}
      >
        <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
          <h2 id={titleId} className="font-display text-lg font-semibold text-stone-900">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="rounded text-stone-400 hover:text-stone-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
