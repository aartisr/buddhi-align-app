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
      className="mb-6 p-4 rounded-lg app-alert-error"
    >
      <p className="font-semibold mb-2 app-alert-error__title">{title}</p>
      <p className="text-sm mb-3 app-alert-error__text">{error}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 rounded text-sm font-medium app-alert-error__button"
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
          className="h-16 rounded animate-pulse app-skeleton-soft"
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
    <div className="text-center py-12 px-4 border border-dashed rounded-lg app-empty-state">
      <p className="text-lg font-semibold mb-2 app-empty-state__title">{title}</p>
      <p className="mb-6 app-empty-state__description">{description}</p>
      {action}
    </div>
  );
}
