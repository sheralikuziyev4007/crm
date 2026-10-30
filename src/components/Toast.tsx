import { Check } from "lucide-react";

// Live-region должна существовать в DOM до появления текста — иначе скринридер не озвучит сообщение
export default function Toast({ message }: { message: string | null }) {
  return (
    <div role="status" aria-live="polite" className="fixed bottom-6 right-6 z-50">
      {message && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-700 bg-[#0F2E24] text-emerald-50 px-4 py-3 text-sm shadow-lg font-mono animate-fadein">
          <Check size={16} className="text-emerald-400 shrink-0" aria-hidden="true" />
          {message}
        </div>
      )}
    </div>
  );
}
