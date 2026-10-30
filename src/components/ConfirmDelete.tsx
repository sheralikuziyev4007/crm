import { useId } from "react";
import Modal from "./Modal";

interface ConfirmDeleteProps {
  name: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ConfirmDelete({ name, onCancel, onConfirm }: ConfirmDeleteProps) {
  const descriptionId = useId();

  return (
    <Modal title="Удалить клиента?" onClose={onCancel} role="alertdialog" describedBy={descriptionId} size="sm">
      <div className="px-5 py-4">
        <p id={descriptionId} className="text-sm text-stone-500">
          Клиент «{name}» будет удалён без возможности восстановления.
        </p>
      </div>
      <div className="flex justify-end gap-2 border-t border-stone-100 px-5 py-4">
        {/* Фокус по умолчанию на безопасном действии */}
        <button
          type="button"
          data-autofocus
          onClick={onCancel}
          className="rounded-lg px-4 py-2 text-sm font-medium text-stone-600 hover:bg-stone-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 transition-colors"
        >
          Отмена
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 transition-colors"
        >
          Удалить
        </button>
      </div>
    </Modal>
  );
}
