import React from "react";
import { ErrorBoundary } from "react-error-boundary";
import { logError } from "../lib/logError";

interface ModuleEntryFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  title: string;
  icon?: string;
  isSubmitting?: boolean;
  submitLabel?: string;
  submitPendingLabel?: string;
  helperText?: string;
  submitButtonClassName?: string;
  onHelpRequest?: () => void;
  copilotState?: "idle" | "drafting";
}

function Fallback({ error }: { error: Error }) {
  return (
    <div className="p-4 rounded-lg bg-(--danger) text-(--on-danger) mb-6">
      <p className="font-bold text-sm">Failed to load form</p>
      <p className="text-xs mt-1">{error.message}</p>
    </div>
  );
}

export default function ModuleEntryForm(props: ModuleEntryFormProps) {
  const {
    title,
    icon,
    isSubmitting,
    submitLabel = "Save",
    submitPendingLabel = "Saving...",
    helperText,
    submitButtonClassName = "app-button-primary",
    onHelpRequest,
    copilotState,
    children,
    className,
    ...formProps
  } = props;

  return (
    <ErrorBoundary FallbackComponent={Fallback} onError={logError}>
      <form
        {...formProps}
        className={`app-surface-card p-6 sm:p-8 rounded-3xl max-w-3xl mx-auto mb-12 shadow-sm border border-(--border-subtle) space-y-8 ${className || ""}`}
      >
        <div className="flex items-center justify-between gap-4 border-b border-(--border-subtle) pb-6">
          <h2 className="text-2xl font-bold tracking-tight text-(--foreground) flex items-center gap-3">
            {icon && <span aria-hidden>{icon}</span>}
            {title}
          </h2>
          {onHelpRequest && (
            <button
              type="button"
              onClick={onHelpRequest}
              disabled={copilotState === "drafting"}
              className="text-xs font-semibold px-4 py-2 rounded-full border border-(--border-soft) bg-(--surface) text-(--primary) hover:bg-(--surface-soft) transition-colors flex items-center gap-2"
              aria-label="Ask Copilot for guidance"
            >
              {copilotState === "drafting" ? (
                <>
                  <span className="app-inline-spinner text-(--primary)" aria-hidden="true" />
                  <span>Drafting...</span>
                </>
              ) : (
                <>
                  <span aria-hidden="true">✨</span>
                  <span>Ask Copilot</span>
                </>
              )}
            </button>
          )}
        </div>

        <div className="space-y-6">
          {children}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-(--border-subtle)">
          {helperText && <p className="text-sm text-(--text-muted)">{helperText}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-8 py-3 rounded-full font-bold transition-all shadow-sm flex items-center justify-center gap-2 ${submitButtonClassName} ${
              isSubmitting ? "opacity-70 cursor-not-allowed" : "hover:-translate-y-0.5 hover:shadow-md"
            }`}
          >
            {isSubmitting ? (
              <>
                <span className="app-inline-spinner" aria-hidden="true" />
                <span>{submitPendingLabel}</span>
              </>
            ) : (
              <span>{submitLabel}</span>
            )}
          </button>
        </div>
      </form>
    </ErrorBoundary>
  );
}
