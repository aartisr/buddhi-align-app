"use client";

import { usePathname, useSearchParams } from "next/navigation";
import React, { type ReactNode } from "react";
import { logEvent } from "@/app/lib/logEvent";

const INVITE_FIRST_ENTRY_SESSION_KEY = "invite_first_entry_submitted";

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
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const inviteSource = searchParams?.get("source")?.trim();
  const inviteModule = searchParams?.get("module")?.trim();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    await onSubmit(event);

    if (inviteSource !== "invite") {
      return;
    }

    const eventData = {
      source: inviteSource,
      module: inviteModule || undefined,
      path: pathname || "/",
    };

    try {
      const alreadyLogged = window.sessionStorage.getItem(INVITE_FIRST_ENTRY_SESSION_KEY) === "1";
      if (alreadyLogged) {
        return;
      }

      logEvent("invite_first_entry_submitted", eventData);
      window.sessionStorage.setItem(INVITE_FIRST_ENTRY_SESSION_KEY, "1");
    } catch {
      logEvent("invite_first_entry_submitted", eventData);
    }
  }

  return (
    <form
      id="quick-start-form"
      className={className}
      onSubmit={handleSubmit}
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
