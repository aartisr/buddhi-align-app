"use client";
import React, { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { buildSignInHref } from "../auth/navigation";
import { logEvent } from "../lib/logEvent";
import { translate, DEFAULT_LOCALE } from "../i18n/config";

const INVITE_FIRST_ENTRY_SESSION_KEY = "buddhi-align:invite-first-entry-submitted";
const DRAFT_STORAGE_PREFIX = "buddhi-align:anonymous-entry-draft:";

function getDraftKey(pathname: string | null) {
  return `${DRAFT_STORAGE_PREFIX}${pathname || "/"}`;
}

function hasAnonymousCookieInHeader(cookie: string): boolean {
  return cookie.split(";").some((item) => item.trim().startsWith("buddhi-align-anonymous=1"));
}

type DraftField = {
  id: string;
  value: string;
};

function setControlledInputValue(element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, value: string) {
  const prototype = Object.getPrototypeOf(element);
  const descriptor = Object.getOwnPropertyDescriptor(prototype, "value");
  descriptor?.set?.call(element, value);
  element.dispatchEvent(new Event("input", { bubbles: true }));
  element.dispatchEvent(new Event("change", { bubbles: true }));
}

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
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void | Promise<void>;
}

export default function ModuleEntryForm(props: ModuleEntryFormProps) {
  const {
    title,
    icon,
    isSubmitting = false,
    submitLabel = "Save",
    submitPendingLabel = "Saving...",
    helperText,
    submitButtonClassName = "app-button-primary",
    onHelpRequest,
    copilotState,
    onSubmit,
    children,
    className,
    ...formProps
  } = props;

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
    if (isAnonymous || hasAnonymousCookieInHeader(document.cookie)) {
      event.preventDefault();
      if (!event.currentTarget.checkValidity()) {
        event.currentTarget.reportValidity();
        return;
      }
      setIsSignInPromptOpen(true);
      return;
    }

    if (onSubmit) {
      await onSubmit(event);
    }

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
        {...formProps}
        onSubmit={handleSubmit}
        aria-label={title}
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
