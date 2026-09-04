// Shared loading-placeholder primitive so every async-content area (AI
// insights, trip suggestions, destination "coming soon" tips, ...) uses the
// same pulse animation and surface treatment instead of ad-hoc divs.
export default function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded bg-surface-sunk ${className}`} />;
}

export function SkeletonCard({ lines = 2, className = "" }) {
  return (
    <div className={`rounded-md bg-surface border border-border p-4 shadow-sm ${className}`}>
      <Skeleton className="h-5 w-5 mb-2" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={`h-3 mt-2 ${i === lines - 1 ? "w-2/3" : "w-full"}`} />
      ))}
    </div>
  );
}
