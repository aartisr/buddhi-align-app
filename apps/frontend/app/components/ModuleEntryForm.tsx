"use client";

import { usePathname, useSearchParams } from "next/navigation";
import React, { useEffect, useRef, useState, type ReactNode } from "react";
import { hasAnonymousCookieInHeader } from "@/app/auth/anonymous";
import { buildSignInHref } from "@/app/auth/navigation";
import { DEFAULT_LOCALE, translate } from "@/app/i18n/config";
import { logEvent } from "@/app/lib/logEvent";

const INVITE_FIRST_ENTRY_SESSION_KEY = "invite_first_entry_submitted";
const ANONYMOUS_DRAFT_SESSION_KEY_PREFIX = "buddhi-align:anonymous-entry-draft:";

type DraftField = {
  id: string;
  value: string;
};

function getDraftKey(pathname: string | null): string {
  return `${ANONYMOUS_DRAFT_SESSION_KEY_PREFIX}${pathname || "/"}`;
}

function setControlledInputValue(element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, value: string) {
  const prototype = Object.getPrototypeOf(element);
  const descriptor = Object.getOwnPropertyDescriptor(prototype, "value");
  descriptor?.set?.call(element, value);
  element.dispatchEvent(new Event("input", { bubbles: true }));
  element.dispatchEvent(new Event("change", { bubbles: true }));
}

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
  const formRef = useRef<HTMLFormElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSignInPromptOpen, setIsSignInPromptOpen] = useState(false);
  const inviteSource = searchParams?.get("source")?.trim();
  const inviteModule = searchParams?.get("module")?.trim();

  useEffect(() => {
    setIsAnonymous(hasAnonymousCookieInHeader(document.cookie));
  }, []);

  useEffect(() => {
    if (hasAnonymousCookieInHeader(document.cookie)) return;

    const savedDraft = window.sessionStorage.getItem(getDraftKey(pathname));
    if (!savedDraft || !formRef.current) return;

    try {
      const fields = JSON.parse(savedDraft) as DraftField[];
      fields.forEach(({ id, value }) => {
        const element = formRef.current?.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(`#${CSS.escape(id)}`);
        if (element) setControlledInputValue(element, value);
      });
      window.sessionStorage.removeItem(getDraftKey(pathname));
    } catch {
      window.sessionStorage.removeItem(getDraftKey(pathname));
    }
  }, [pathname]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isSignInPromptOpen && !dialog.open) {
      dialog.showModal();
    }

    if (!isSignInPromptOpen && dialog.open) {
      dialog.close();
    }
  }, [isSignInPromptOpen]);

  function keepDraftForSignIn() {
    const fields = Array.from(
      formRef.current?.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>("input, textarea, select") ?? [],
    ).filter((element) => element.id).map(({ id, value }) => ({ id, value }));

    window.sessionStorage.setItem(getDraftKey(pathname), JSON.stringify(fields));
  }

  function closeSignInPrompt() {
    setIsSignInPromptOpen(false);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isAnonymous || hasAnonymousCookieInHeader(document.cookie)) {
      if (!event.currentTarget.checkValidity()) {
        event.currentTarget.reportValidity();
        return;
      }

      setIsSignInPromptOpen(true);
      return;
    }

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
    <>
      <form
        ref={formRef}
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

      <dialog
        ref={dialogRef}
        className="app-save-signin-dialog"
        aria-labelledby="save-signin-title"
        onCancel={(event) => {
          event.preventDefault();
          closeSignInPrompt();
        }}
        onClose={closeSignInPrompt}
      >
        <div className="app-save-signin-dialog__content">
          <p className="app-save-signin-dialog__eyebrow">{translate(DEFAULT_LOCALE, "auth.savePrompt.eyebrow")}</p>
          <h2 id="save-signin-title" className="app-save-signin-dialog__title">{translate(DEFAULT_LOCALE, "auth.savePrompt.title")}</h2>
          <p className="app-save-signin-dialog__copy">{translate(DEFAULT_LOCALE, "auth.savePrompt.body")}</p>
          <div className="app-save-signin-dialog__actions">
            <a
              href={`${buildSignInHref(`${pathname || "/"}${searchParams?.toString() ? `?${searchParams.toString()}` : ""}`)}&intent=save`}
              className="app-save-signin-dialog__primary"
              onClick={keepDraftForSignIn}
            >
              {translate(DEFAULT_LOCALE, "auth.savePrompt.primary")}
            </a>
            <button type="button" className="app-save-signin-dialog__secondary" onClick={closeSignInPrompt}>
              {translate(DEFAULT_LOCALE, "auth.savePrompt.secondary")}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
