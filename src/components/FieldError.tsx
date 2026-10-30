import { AlertCircle } from "lucide-react";

// role="alert" — скринридер озвучивает ошибку сразу при появлении
export default function FieldError({ id, msg }: { id?: string; msg?: string }) {
  if (!msg) return null;
  return (
    <div id={id} role="alert" className="flex items-center gap-1 mt-1 text-xs text-rose-600 dark:text-rose-400">
      <AlertCircle size={12} aria-hidden="true" /> {msg}
    </div>
  );
}
