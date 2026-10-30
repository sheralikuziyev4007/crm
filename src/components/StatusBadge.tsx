import { getStatus } from "../utils/constants";

export default function StatusBadge({ status }: { status: string }) {
  const s = getStatus(status);
  return (
    <span
      style={{ backgroundColor: s.bg, color: s.color }}
      className="inline-block rounded px-2 py-0.5 text-[11px] font-mono font-medium uppercase tracking-wide"
    >
      {s.label}
    </span>
  );
}
