"use client";

import type { ReactNode } from "react";

interface ModuleEntryFormProps {
  title: string;
  icon: string;
  className: string;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void | Promise<void>;
  children: ReactNode;
  submitLabel: string;
  submitPendingLabel?: string;
  helperText?: string;
  submitButtonClassName?: string;
  isSubmitting?: boolean;
}

export default function ModuleEntryForm({
  title,
  icon,
  className,
  onSubmit,
  children,
  submitLabel,
  submitPendingLabel,
  helperText,
  submitButtonClassName,
  isSubmitting = false,
}: ModuleEntryFormProps) {
  return (
    <form
      className={className}
      onSubmit={onSubmit}
      aria-label={title}
    >
      <div className="flex flex-col gap-4 w-full">
        <span className="text-3xl self-center" aria-hidden>
          {icon}
        </span>
        {helperText ? <p className="app-copy-soft text-sm text-center -mt-1">{helperText}</p> : null}
        {children}
        <button
          type="submit"
          disabled={isSubmitting}
          className={
            submitButtonClassName ??
            "app-button-primary app-button-primary--karma"
          }
          aria-label={submitLabel}
        >
          <span className="text-xl">{isSubmitting ? "⏳" : "➕"}</span>{" "}
          <span className="font-bold">{isSubmitting ? (submitPendingLabel ?? `${submitLabel}...`) : submitLabel}</span>
        </button>
      </div>
    </form>
  );
}
