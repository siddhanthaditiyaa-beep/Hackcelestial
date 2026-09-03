import { Loader2 } from "lucide-react";

const VARIANTS = {
  primary: "bg-brand text-brand-ink hover:brightness-105 shadow-sm hover:shadow-md",
  dark: "bg-ink text-page hover:opacity-90 shadow-sm hover:shadow-md",
  secondary: "bg-surface border border-border text-ink hover:border-border-strong hover:bg-surface-sunk",
  ghost: "text-ink-dim hover:text-ink hover:bg-surface-sunk",
  danger: "bg-status-disrupted text-white hover:brightness-105 shadow-sm",
};

const SIZES = {
  sm: "text-xs px-3.5 py-2 gap-1.5",
  md: "text-sm px-4.5 py-2.5 gap-2",
  lg: "text-sm px-6 py-3.5 gap-2",
};

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon: Icon,
  className = "",
  children,
  ...props
}) {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center rounded-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          {Icon && <Icon className="h-4 w-4" />}
          {children}
        </>
      )}
    </button>
  );
}
