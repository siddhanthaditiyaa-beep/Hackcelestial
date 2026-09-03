import { useState, useRef, useId } from "react";
import { searchLocations } from "../../data/locations";

export default function Autocomplete({
  value,
  onChange,
  placeholder,
  icon: Icon,
  dark = false,
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const blurTimeout = useRef(null);
  const listId = useId();

  const matches = searchLocations(value);

  const select = (loc) => {
    onChange(loc.label);
    setOpen(false);
    setHighlight(-1);
  };

  const handleKeyDown = (e) => {
    if (!open || matches.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, matches.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter" && highlight >= 0) {
      e.preventDefault();
      select(matches[highlight]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const inputBase = dark
    ? "w-full bg-white/8 border border-white/10 rounded-sm pl-9 pr-3 py-3 text-white placeholder:text-white/40 text-sm outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition"
    : "w-full bg-surface-sunk border border-border rounded-sm pl-9 pr-3 py-3 text-sm text-ink placeholder:text-ink-faint outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/20 transition";

  const iconColor = dark ? "text-white/50" : "text-ink-faint";

  return (
    <div className={`relative ${className}`}>
      {Icon && <Icon className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${iconColor} pointer-events-none z-10`} />}
      <input
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true); setHighlight(-1); }}
        onFocus={() => setOpen(true)}
        onBlur={() => { blurTimeout.current = setTimeout(() => setOpen(false), 120); }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={inputBase}
        autoComplete="off"
      />
      {open && matches.length > 0 && (
        <ul
          id={listId}
          className="absolute z-30 mt-1.5 w-full max-h-56 overflow-y-auto rounded-sm border border-border bg-surface shadow-md py-1"
        >
          {matches.map((loc, i) => (
            <li key={loc.id}>
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); clearTimeout(blurTimeout.current); select(loc); }}
                className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between gap-2 transition-colors ${
                  i === highlight ? "bg-brand-dim text-brand" : "text-ink hover:bg-surface-sunk"
                }`}
              >
                <span className="font-medium">{loc.label}</span>
                <span className="text-xs text-ink-faint">{loc.sublabel}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
