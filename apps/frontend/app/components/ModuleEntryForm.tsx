"use client";

import type { ReactNode } from "react";

interface ModuleEntryFormProps {
  title: string;
  icon: string;
  className: string;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void | Promise<void>;
  children: ReactNode;
  submitLabel: string;
  submitButtonClassName?: string;
}

export default function ModuleEntryForm({
  title,
  icon,
  className,
  onSubmit,
  children,
  submitLabel,
  submitButtonClassName,
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
        {children}
        <button
          type="submit"
          className={
            submitButtonClassName ??
            "app-button-primary app-button-primary--karma"
          }
          aria-label={submitLabel}
        >
          <span className="text-xl">➕</span> <span className="font-bold">{submitLabel}</span>
        </button>
      </div>
    </form>
  );
}
