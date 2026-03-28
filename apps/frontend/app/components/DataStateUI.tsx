import React from "react";

/**
 * Error display component for module data errors
 */
export function ErrorAlert({
  error,
  title,
  retryLabel,
  retryAriaLabel,
  onRetry,
}: {
  error: string | null;
  title: string;
  retryLabel: string;
  retryAriaLabel: string;
  onRetry?: () => void;
}) {
  if (!error) return null;

  return (
    <div
      role="alert"
      className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
    >
      <p className="text-red-800 font-semibold mb-2">{title}</p>
      <p className="text-red-700 text-sm mb-3">{error}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium"
          aria-label={retryAriaLabel}
        >
          {retryLabel}
        </button>
      )}
    </div>
  );
}

/**
 * Loading skeleton component
 */
export function LoadingSkeleton({ count = 3, loadingLabel }: { count?: number; loadingLabel: string }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-16 bg-zinc-200 rounded animate-pulse"
          role="status"
          aria-label={loadingLabel}
        />
      ))}
    </div>
  );
}

/**
 * Empty state component
 */
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="text-center py-12 px-4 border border-dashed border-zinc-300 rounded-lg bg-zinc-50">
      <p className="text-lg font-semibold text-zinc-900 mb-2">{title}</p>
      <p className="text-zinc-600 mb-6">{description}</p>
      {action}
    </div>
  );
}
