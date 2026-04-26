"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import type {
  SupportReportCategory,
  SupportReportDiagnostics,
  SupportReportReproducibility,
  SupportReportSeverity,
} from "@/app/lib/support-reports";

type SubmitState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; reportId: string }
  | { status: "error"; message: string };

type SupportFormState = {
  category: SupportReportCategory;
  severity: SupportReportSeverity;
  title: string;
  pageUrl: string;
  tryingToDo: string;
  actualBehavior: string;
  expectedBehavior: string;
  reproducibility: SupportReportReproducibility;
  contactEmail: string;
  consentToDiagnostics: boolean;
  company: string;
};

const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@foreverlotus.com";
const titleMinLength = 8;
const reportTextMinLength = 10;

const categoryOptions: Array<{ value: SupportReportCategory; label: string; detail: string }> = [
  { value: "bug", label: "Something is broken", detail: "Errors, missing pages, forms, buttons, or unexpected behavior." },
  { value: "sign-in", label: "Sign-in or account", detail: "Login loops, provider errors, sessions, or saved data concerns." },
  { value: "autograph", label: "Autograph Exchange", detail: "Profiles, photos, requests, signatures, or keepsake display issues." },
  { value: "community", label: "Community", detail: "In-app community pages, SSO, topics, or discussion access." },
  { value: "accessibility", label: "Accessibility", detail: "Keyboard, screen reader, contrast, captions, motion, or zoom barriers." },
  { value: "performance", label: "Performance", detail: "Slow pages, mobile loading, freezes, or repeated retries." },
  { value: "content", label: "Content or SEO", detail: "Typos, confusing copy, metadata, search preview, or social sharing issues." },
  { value: "privacy-security", label: "Privacy or security", detail: "Private data exposure, suspicious behavior, or account safety." },
  { value: "feedback", label: "Idea or feedback", detail: "Suggestions that would make the app clearer, calmer, or more useful." },
];

const severityOptions: Array<{ value: SupportReportSeverity; label: string; detail: string }> = [
  { value: "normal", label: "Normal", detail: "A feature or page is not behaving as expected." },
  { value: "high", label: "High", detail: "A core workflow is blocked or repeatedly failing." },
  { value: "urgent", label: "Urgent", detail: "Site is unavailable, data seems at risk, or many users are blocked." },
  { value: "low", label: "Low", detail: "A cosmetic issue, typo, or small improvement." },
];

const reproducibilityOptions: Array<{ value: SupportReportReproducibility; label: string }> = [
  { value: "always", label: "Every time" },
  { value: "sometimes", label: "Sometimes" },
  { value: "once", label: "Only once" },
  { value: "not-sure", label: "Not sure yet" },
];

const startingForm: SupportFormState = {
  category: "bug",
  severity: "normal",
  title: "",
  pageUrl: "",
  tryingToDo: "",
  actualBehavior: "",
  expectedBehavior: "",
  reproducibility: "not-sure",
  contactEmail: "",
  consentToDiagnostics: true,
  company: "",
};

function captureDiagnostics(): SupportReportDiagnostics {
  const connection = (navigator as Navigator & {
    connection?: { effectiveType?: string; downlink?: number; saveData?: boolean };
  }).connection;
  return {
    url: window.location.href,
    referrer: document.referrer || undefined,
    userAgent: navigator.userAgent,
    language: navigator.language,
    languages: Array.from(navigator.languages ?? []),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    screen: `${window.screen.width}x${window.screen.height}`,
    devicePixelRatio: window.devicePixelRatio,
    online: navigator.onLine,
    connection: connection
      ? [
          connection.effectiveType,
          typeof connection.downlink === "number" ? `${connection.downlink}Mbps` : "",
          connection.saveData ? "save-data" : "",
        ].filter(Boolean).join(" / ")
      : undefined,
    capturedAt: new Date().toISOString(),
  };
}

function buildReportText(form: SupportFormState, diagnostics: SupportReportDiagnostics | null, reportId?: string) {
  const lines = [
    reportId ? `Report ID: ${reportId}` : null,
    `Category: ${form.category}`,
    `Severity: ${form.severity}`,
    `Title: ${form.title}`,
    `Page: ${form.pageUrl || "Not provided"}`,
    `Reproducibility: ${form.reproducibility}`,
    "",
    "What were you trying to do?",
    form.tryingToDo,
    "",
    "What happened?",
    form.actualBehavior,
    "",
    "What did you expect?",
    form.expectedBehavior || "Not provided",
    "",
    form.contactEmail ? `Contact: ${form.contactEmail}` : "Contact: Not provided",
  ];

  if (form.consentToDiagnostics && diagnostics) {
    lines.push(
      "",
      "Diagnostic context",
      `Browser: ${diagnostics.userAgent ?? "unknown"}`,
      `Viewport: ${diagnostics.viewport ?? "unknown"}`,
      `Screen: ${diagnostics.screen ?? "unknown"}`,
      `Language: ${diagnostics.language ?? "unknown"}`,
      `Timezone: ${diagnostics.timezone ?? "unknown"}`,
      `Online: ${diagnostics.online === false ? "no" : "yes"}`,
    );
  }

  return lines.filter((line): line is string => line !== null).join("\n");
}

function buildMailtoHref(reportText: string) {
  const params = new URLSearchParams({
    subject: "Buddhi Align support report",
    body: reportText,
  });
  return `mailto:${supportEmail}?${params.toString()}`;
}

type UpdateField = <K extends keyof SupportFormState>(key: K, value: SupportFormState[K]) => void;

function SupportHero() {
  return (
    <section className="app-support-hero" aria-labelledby="support-intro">
      <p className="app-guided-flow-kicker">Support desk</p>
      <h2 id="support-intro" className="app-panel-title text-xl sm:text-2xl font-bold leading-tight">
        Report an issue with enough clarity to fix it
      </h2>
      <p className="app-copy-soft text-sm sm:text-base mt-2">
        Share what you were trying to do, what happened, and the page where it happened. The form can include safe browser context so fewer follow-up questions are needed.
      </p>
    </section>
  );
}

function CategoryField({ form, updateField }: { form: SupportFormState; updateField: UpdateField }) {
  return (
    <div className="app-support-field">
      <label htmlFor="support-category">What kind of issue is this?</label>
      <select
        id="support-category"
        className="app-input"
        value={form.category}
        onChange={(event) => updateField("category", event.target.value as SupportReportCategory)}
      >
        {categoryOptions.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      <p>{categoryOptions.find((option) => option.value === form.category)?.detail}</p>
    </div>
  );
}

function SeveritySelector({ severity, updateField }: { severity: SupportReportSeverity; updateField: UpdateField }) {
  return (
    <fieldset className="app-support-field">
      <legend>How serious is it?</legend>
      <div className="app-support-severity-grid">
        {severityOptions.map((option) => (
          <label key={option.value} className={`app-support-choice${severity === option.value ? " is-selected" : ""}`}>
            <input
              type="radio"
              name="severity"
              value={option.value}
              checked={severity === option.value}
              onChange={() => updateField("severity", option.value)}
            />
            <span>{option.label}</span>
            <small>{option.detail}</small>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function CoreFields({ form, updateField }: { form: SupportFormState; updateField: UpdateField }) {
  return (
    <>
      <div className="app-support-grid">
        <TextInputField id="support-title" label="Short issue title" value={form.title} onChange={(value) => updateField("title", value)} placeholder="Example: Profile photo upload fails on iPhone" minLength={titleMinLength} maxLength={140} required />
        <TextInputField id="support-page-url" label="Where did it happen?" value={form.pageUrl} onChange={(value) => updateField("pageUrl", value)} placeholder="Paste the page URL or name" maxLength={600} />
      </div>
      <TextAreaField id="support-trying" label="What were you trying to do?" value={form.tryingToDo} onChange={(value) => updateField("tryingToDo", value)} rows={3} placeholder="Describe the task or goal in your own words." minLength={reportTextMinLength} required />
      <TextAreaField id="support-actual" label="What happened instead?" value={form.actualBehavior} onChange={(value) => updateField("actualBehavior", value)} rows={4} placeholder="Include exact error text, confusing behavior, or what you saw on screen." minLength={reportTextMinLength} required />
    </>
  );
}

function TextInputField({
  id,
  label,
  value,
  onChange,
  placeholder,
  minLength,
  maxLength,
  required,
  type = "text",
  inputMode,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  minLength?: number;
  maxLength?: number;
  required?: boolean;
  type?: "email" | "text" | "url";
  inputMode?: "email" | "text" | "url";
}) {
  return (
    <div className="app-support-field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        inputMode={inputMode}
        className="app-input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        minLength={minLength}
        maxLength={maxLength}
        required={required}
      />
    </div>
  );
}

function TextAreaField({
  id,
  label,
  value,
  onChange,
  rows,
  placeholder,
  minLength,
  required,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows: number;
  placeholder: string;
  minLength?: number;
  required?: boolean;
}) {
  return (
    <div className="app-support-field">
      <label htmlFor={id}>{label}</label>
      <textarea
        id={id}
        className="app-input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        placeholder={placeholder}
        minLength={minLength}
        required={required}
      />
    </div>
  );
}

function FollowUpFields({ form, updateField }: { form: SupportFormState; updateField: UpdateField }) {
  return (
    <>
      <div className="app-support-grid">
        <TextAreaField id="support-expected" label="What did you expect?" value={form.expectedBehavior} onChange={(value) => updateField("expectedBehavior", value)} rows={3} placeholder="A short note is enough." />
        <div className="app-support-field">
          <label htmlFor="support-reproducibility">Can it happen again?</label>
          <select
            id="support-reproducibility"
            className="app-input"
            value={form.reproducibility}
            onChange={(event) => updateField("reproducibility", event.target.value as SupportReportReproducibility)}
          >
            {reproducibilityOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>
      <TextInputField
        id="support-email"
        label="Email for follow-up"
        value={form.contactEmail}
        onChange={(value) => updateField("contactEmail", value)}
        placeholder="Optional"
        type="email"
        inputMode="email"
      />
      <p className="app-copy-soft text-xs -mt-3">Leave email blank if you only want to send the report without a reply.</p>
    </>
  );
}

function ConsentAndHoneypot({ form, updateField }: { form: SupportFormState; updateField: UpdateField }) {
  return (
    <>
      <label className="app-support-consent">
        <input
          type="checkbox"
          checked={form.consentToDiagnostics}
          onChange={(event) => updateField("consentToDiagnostics", event.target.checked)}
        />
        <span>
          Include browser, viewport, language, time zone, and connection context. This does not include passwords, journal entries, photos, or payment information.
        </span>
      </label>
      <div className="hidden" aria-hidden="true">
        <label>
          Company
          <input tabIndex={-1} autoComplete="off" value={form.company} onChange={(event) => updateField("company", event.target.value)} />
        </label>
      </div>
    </>
  );
}

function SupportActions({
  submitState,
  copied,
  mailtoHref,
  canSubmit,
  copyReport,
}: {
  submitState: SubmitState;
  copied: boolean;
  mailtoHref: string;
  canSubmit: boolean;
  copyReport: () => void;
}) {
  return (
    <div className="app-support-actions">
      <button type="submit" className="app-user-action app-support-submit" disabled={!canSubmit}>
        {submitState.status === "submitting" ? "Sending report..." : "Send report"}
      </button>
      <button type="button" className="app-support-secondary" onClick={copyReport}>
        {copied ? "Copied" : "Copy report"}
      </button>
      <a className="app-support-secondary" href={mailtoHref}>
        Email report
      </a>
    </div>
  );
}

function SupportStatus({ submitState }: { submitState: SubmitState }) {
  return (
    <div className="app-support-status" aria-live="polite">
      {submitState.status === "success" ? (
        <p className="app-support-status-success">
          Report received: <strong>{submitState.reportId}</strong>. Thank you for making the app better.
        </p>
      ) : null}
      {submitState.status === "error" ? (
        <p className="app-support-status-error">{submitState.message}</p>
      ) : null}
    </div>
  );
}

function SupportGuidance({ diagnostics }: { diagnostics: SupportReportDiagnostics | null }) {
  return (
    <aside className="app-support-side" aria-label="Support guidance">
      <article className="app-support-panel">
        <p className="app-guided-flow-kicker">What helps most</p>
        <h3>Fast triage details</h3>
        <ul>
          <li>One report per issue keeps fixes trackable.</li>
          <li>Exact error text is more useful than a general description.</li>
          <li>Accessibility reports are welcome; include your assistive technology if you use one.</li>
          <li>For privacy or security concerns, describe the risk but do not paste secrets.</li>
        </ul>
      </article>
      <article className="app-support-panel app-support-panel--warm">
        <p className="app-guided-flow-kicker">What happens next</p>
        <h3>A calm path to resolution</h3>
        <ol>
          <li>The report is saved with a support ID.</li>
          <li>Admin can review severity, page, and diagnostic context.</li>
          <li>Reports can move from new to reviewing to resolved.</li>
        </ol>
      </article>
      <article className="app-support-panel">
        <p className="app-guided-flow-kicker">Diagnostic preview</p>
        <dl className="app-support-diagnostics">
          <div><dt>Viewport</dt><dd>{diagnostics?.viewport ?? "Pending"}</dd></div>
          <div><dt>Language</dt><dd>{diagnostics?.language ?? "Pending"}</dd></div>
          <div><dt>Time zone</dt><dd>{diagnostics?.timezone ?? "Pending"}</dd></div>
          <div><dt>Online</dt><dd>{diagnostics?.online === false ? "No" : "Yes"}</dd></div>
        </dl>
      </article>
    </aside>
  );
}

function SupportReportForm({
  form,
  submitState,
  copied,
  mailtoHref,
  canSubmit,
  updateField,
  submitReport,
  copyReport,
}: {
  form: SupportFormState;
  submitState: SubmitState;
  copied: boolean;
  mailtoHref: string;
  canSubmit: boolean;
  updateField: UpdateField;
  submitReport: (event: FormEvent<HTMLFormElement>) => void;
  copyReport: () => void;
}) {
  return (
    <form className="app-support-form app-form-shell" onSubmit={submitReport}>
      <div className="app-support-form-header">
        <div>
          <p className="app-guided-flow-kicker">Issue report</p>
          <h3 className="app-panel-title text-lg sm:text-xl font-bold">Tell us what went wrong</h3>
        </div>
        <span className="app-support-safe-note">No passwords or one-time codes</span>
      </div>
      <CategoryField form={form} updateField={updateField} />
      <SeveritySelector severity={form.severity} updateField={updateField} />
      <CoreFields form={form} updateField={updateField} />
      <FollowUpFields form={form} updateField={updateField} />
      <ConsentAndHoneypot form={form} updateField={updateField} />
      <SupportActions
        submitState={submitState}
        copied={copied}
        mailtoHref={mailtoHref}
        canSubmit={canSubmit}
        copyReport={copyReport}
      />
      <SupportStatus submitState={submitState} />
    </form>
  );
}

export default function SupportPageClient() {
  const searchParams = useSearchParams();
  const [form, setForm] = useState<SupportFormState>(startingForm);
  const [diagnostics, setDiagnostics] = useState<SupportReportDiagnostics | null>(null);
  const [submitState, setSubmitState] = useState<SubmitState>({ status: "idle" });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const captured = captureDiagnostics();
    const pageParam = searchParams?.get("page")?.trim();
    setDiagnostics(captured);
    setForm((current) => ({ ...current, pageUrl: pageParam || captured.referrer || "" }));
  }, [searchParams]);

  const reportText = useMemo(
    () => buildReportText(form, diagnostics, submitState.status === "success" ? submitState.reportId : undefined),
    [diagnostics, form, submitState],
  );
  const mailtoHref = useMemo(() => buildMailtoHref(reportText), [reportText]);
  const canSubmit = submitState.status !== "submitting";

  function updateField<K extends keyof SupportFormState>(key: K, value: SupportFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function copyReport() {
    try {
      await navigator.clipboard.writeText(reportText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  async function submitReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;
    if (!event.currentTarget.checkValidity()) {
      event.currentTarget.reportValidity();
      return;
    }
    setSubmitState({ status: "submitting" });
    try {
      const response = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, diagnostics: form.consentToDiagnostics ? diagnostics : undefined }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(typeof payload.error === "string" ? payload.error : "The report could not be sent.");
      }
      setSubmitState({ status: "success", reportId: payload.reportId ?? "BA-SUP-QUEUED" });
    } catch (error) {
      setSubmitState({ status: "error", message: error instanceof Error ? error.message : "The report could not be sent." });
    }
  }

  return (
    <div className="app-support-shell">
      <SupportHero />
      <div className="app-support-layout">
        <SupportReportForm
          form={form}
          submitState={submitState}
          copied={copied}
          mailtoHref={mailtoHref}
          canSubmit={canSubmit}
          updateField={updateField}
          submitReport={submitReport}
          copyReport={copyReport}
        />
        <SupportGuidance diagnostics={diagnostics} />
      </div>
    </div>
  );
}
