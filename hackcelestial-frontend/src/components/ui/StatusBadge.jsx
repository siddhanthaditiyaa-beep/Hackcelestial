import { STATUS_STYLES } from "../../utils/visuals";

export default function StatusBadge({ status, className = "" }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.confirmed;
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ${s.badgeBg} ${s.badgeText} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}
