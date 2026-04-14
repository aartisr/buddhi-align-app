"use client";

import React from "react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import ModuleLayout from "@/app/components/ModuleLayout";
import { useI18n } from "@/app/i18n/provider";
import { useAutographExchange } from "@/app/hooks/useAutographExchange";
import type { AutographProfile, AutographRequest, AutographRole } from "@/app/lib/autographs/types";
import "./autograph-exchange.css";

const INPUT_CLASS =
  "app-form-input border-2 border-primary bg-surface rounded-xl px-3 py-2 w-full max-w-full min-w-0 focus:outline-none focus:ring-2 focus:ring-primary text-base shadow-sm";

type Translate = ReturnType<typeof useI18n>["t"];

type ProfileFormState = { displayName: string; role: AutographRole };
type RequestFormState = { signerUserId: string; message: string };

type RoleOption = { value: AutographRole; label: string };

type ArchiveSort = "newest" | "oldest";

function LoadingState({ t }: { t: Translate }) {
  return (
    <ModuleLayout titleKey="module.autograph.title">
      <div className="max-w-4xl mx-auto app-copy-soft">{t("user.loadingSession")}</div>
    </ModuleLayout>
  );
}

function SignedOutState({ t }: { t: Translate }) {
  return (
    <ModuleLayout titleKey="module.autograph.title">
      <section className="max-w-3xl mx-auto app-surface-card p-6 rounded-2xl">
        <p className="app-copy-soft mb-4">{t("auth.persistHint")}</p>
        <Link href="/sign-in" className="app-anonymous-banner-cta">
          {t("auth.signInToSave")}
        </Link>
      </section>
    </ModuleLayout>
  );
}

function formatRelativeDate(iso: string): string {
  const target = new Date(iso).getTime();
  if (!Number.isFinite(target)) {
    return "Recently";
  }

  const diffMs = Date.now() - target;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 14) return `${diffDay}d ago`;
  return new Date(iso).toLocaleDateString();
}

function rolePairLabel(request: AutographRequest): string {
  return `${request.requesterRole} to ${request.signerRole}`;
}

function StatusPill({ status }: { status: AutographRequest["status"] }) {
  return (
    <span
      className={`autograph-status-pill ${status === "pending" ? "is-pending" : "is-signed"}`}
      data-testid={`status-${status}`}
    >
      {status === "pending" ? "Pending" : "Signed"}
    </span>
  );
}

function ProfileSection({
  t,
  roleOptions,
  profileForm,
  setProfileForm,
  effectiveProfileName,
  effectiveProfileRole,
  busyAction,
  onSubmit,
}: {
  t: Translate;
  roleOptions: RoleOption[];
  profileForm: ProfileFormState;
  setProfileForm: React.Dispatch<React.SetStateAction<ProfileFormState>>;
  effectiveProfileName: string;
  effectiveProfileRole: AutographRole;
  busyAction: string | null;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
}) {
  return (
    <section className="app-surface-card p-5 rounded-2xl grid gap-4">
      <header>
        <h3 className="text-lg font-semibold">{t("autograph.profile.title")}</h3>
        <p className="app-copy-soft text-sm mt-1">{t("autograph.profile.subtitle")}</p>
      </header>
      <form className="grid sm:grid-cols-3 gap-3" onSubmit={onSubmit}>
        <label className="flex flex-col gap-1">
          <span className="app-form-label">{t("autograph.profile.displayName")}</span>
          <input
            className={INPUT_CLASS}
            value={profileForm.displayName}
            onChange={(e) => setProfileForm((prev) => ({ ...prev, displayName: e.target.value }))}
            placeholder={effectiveProfileName}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="app-form-label">{t("autograph.profile.role")}</span>
          <select
            className={INPUT_CLASS}
            value={profileForm.role || effectiveProfileRole}
            onChange={(e) => setProfileForm((prev) => ({ ...prev, role: e.target.value as AutographRole }))}
          >
            {roleOptions.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end">
          <button type="submit" className="app-button-primary w-full" disabled={busyAction === "profile"}>
            {busyAction === "profile" ? t("autograph.profile.saving") : t("autograph.profile.save")}
          </button>
        </div>
      </form>
    </section>
  );
}

function RequestSection({
  t,
  requestForm,
  setRequestForm,
  availableSigners,
  hasProfile,
  loading,
  busyAction,
  onSubmit,
}: {
  t: Translate;
  requestForm: RequestFormState;
  setRequestForm: React.Dispatch<React.SetStateAction<RequestFormState>>;
  availableSigners: AutographProfile[];
  hasProfile: boolean;
  loading: boolean;
  busyAction: string | null;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
}) {
  return (
    <section className="app-surface-card p-5 rounded-2xl grid gap-4">
      <header>
        <h3 className="text-lg font-semibold">{t("autograph.request.title")}</h3>
      </header>
      <form className="grid gap-3" onSubmit={onSubmit}>
        <label className="flex flex-col gap-1">
          <span className="app-form-label">{t("autograph.request.signer")}</span>
          <select
            className={INPUT_CLASS}
            value={requestForm.signerUserId}
            onChange={(e) => setRequestForm((prev) => ({ ...prev, signerUserId: e.target.value }))}
            required
          >
            <option value="">--</option>
            {availableSigners.map((profile) => (
              <option key={profile.userId} value={profile.userId}>
                {profile.displayName} ({t(`autograph.profile.role.${profile.role}` as never)})
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="app-form-label">{t("autograph.request.message")}</span>
          <textarea
            className={INPUT_CLASS}
            rows={3}
            value={requestForm.message}
            onChange={(e) => setRequestForm((prev) => ({ ...prev, message: e.target.value }))}
            placeholder={t("autograph.request.messagePlaceholder")}
            required
          />
        </label>
        <div className="flex justify-end">
          <button type="submit" className="app-button-primary" disabled={busyAction === "request" || !hasProfile}>
            <span aria-hidden>{busyAction === "request" ? "⏳" : "✉️"}</span>
            <span>{busyAction === "request" ? t("autograph.request.submitting") : t("autograph.request.submit")}</span>
          </button>
        </div>
      </form>
      {!hasProfile ? (
        <p className="app-copy-soft text-sm">{t("autograph.profile.subtitle")}</p>
      ) : null}
      {!loading && availableSigners.length === 0 ? (
        <p className="app-copy-soft text-sm">{t("autograph.empty.profiles")}</p>
      ) : null}
    </section>
  );
}

function InboxColumn({
  t,
  inbox,
  signatureDrafts,
  setSignatureDrafts,
  busyAction,
  expandedRequestId,
  setExpandedRequestId,
  lastSignedRequestId,
  onSign,
}: {
  t: Translate;
  inbox: AutographRequest[];
  signatureDrafts: Record<string, string>;
  setSignatureDrafts: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  busyAction: string | null;
  expandedRequestId: string | null;
  setExpandedRequestId: React.Dispatch<React.SetStateAction<string | null>>;
  lastSignedRequestId: string | null;
  onSign: (requestId: string) => Promise<void>;
}) {
  return (
    <section className="autograph-lane autograph-lane-pending autograph-tone-inbox" aria-label={t("autograph.inbox.title")}> 
      <header className="autograph-lane-header">
        <h3 className="font-semibold">{t("autograph.inbox.title")}</h3>
        <p className="autograph-lane-meta">{inbox.length} pending</p>
      </header>
      {inbox.length === 0 ? (
        <p className="app-copy-soft text-sm autograph-empty">{t("autograph.empty.inbox")}</p>
      ) : (
        inbox.map((item) => (
          <article
            key={item.id}
            className={`autograph-request-card ${lastSignedRequestId === item.id ? "is-just-signed" : ""}`}
            data-testid="pending-request-card"
          >
            <div className="autograph-request-card-header">
              <p className="text-sm font-medium">{item.requesterDisplayName}</p>
              <StatusPill status={item.status} />
            </div>
            <p className="autograph-request-pair">{rolePairLabel(item)}</p>
            <p className="text-xs app-copy-soft">{item.message}</p>
            <p className="autograph-request-time">Requested {formatRelativeDate(item.createdAt)}</p>

            <div className="autograph-request-actions">
              <button
                className="autograph-secondary-btn"
                onClick={() => setExpandedRequestId((prev) => (prev === item.id ? null : item.id))}
                aria-label={`Open signing form for ${item.requesterDisplayName}`}
              >
                {expandedRequestId === item.id ? "Hide form" : t("autograph.sign.submit")}
              </button>
            </div>

            {expandedRequestId === item.id ? (
              <div className="autograph-sign-panel" data-testid="sign-editor">
                <label className="flex flex-col gap-1">
                  <span className="app-form-label">{t("autograph.sign.label")}</span>
                  <textarea
                    className={INPUT_CLASS}
                    rows={3}
                    value={signatureDrafts[item.id] ?? ""}
                    placeholder={t("autograph.sign.placeholder")}
                    onChange={(e) => setSignatureDrafts((prev) => ({ ...prev, [item.id]: e.target.value }))}
                  />
                </label>
                <div className="autograph-sign-footer">
                  <span className="autograph-char-count">{(signatureDrafts[item.id] ?? "").trim().length}/240</span>
                  <button
                    className="app-button-primary"
                    onClick={() => void onSign(item.id)}
                    disabled={busyAction === `sign:${item.id}` || !(signatureDrafts[item.id] ?? "").trim()}
                  >
                    {busyAction === `sign:${item.id}` ? "Signing..." : "Confirm signature"}
                  </button>
                </div>
              </div>
            ) : null}
          </article>
        ))
      )}
    </section>
  );
}

function OutboxColumn({ t, outbox }: { t: Translate; outbox: AutographRequest[] }) {
  return (
    <section className="autograph-outbox autograph-tone-sent" aria-label={t("autograph.outbox.title")}>
      <h3 className="font-semibold">{t("autograph.outbox.title")}</h3>
      {outbox.length === 0 ? (
        <p className="app-copy-soft text-sm">{t("autograph.empty.outbox")}</p>
      ) : (
        outbox.map((item) => (
          <article key={item.id} className="autograph-outbox-card">
            <p className="text-sm font-medium">{item.signerDisplayName}</p>
            <p className="text-xs app-copy-soft line-clamp-1">{item.message}</p>
            <p className="autograph-request-time">{formatRelativeDate(item.createdAt)}</p>
          </article>
        ))
      )}
    </section>
  );
}

function ArchiveColumn({
  t,
  archive,
  filter,
  setFilter,
  sort,
  setSort,
  lastSignedRequestId,
}: {
  t: Translate;
  archive: AutographRequest[];
  filter: string;
  setFilter: React.Dispatch<React.SetStateAction<string>>;
  sort: ArchiveSort;
  setSort: React.Dispatch<React.SetStateAction<ArchiveSort>>;
  lastSignedRequestId: string | null;
}) {
  return (
    <section className="autograph-lane autograph-lane-archive autograph-tone-archive" aria-label={t("autograph.archive.title")}> 
      <header className="autograph-lane-header">
        <h3 className="font-semibold">{t("autograph.archive.title")}</h3>
        <p className="autograph-lane-meta">{archive.length} total</p>
      </header>
      <div className="autograph-archive-controls">
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter signed autographs"
          className={`${INPUT_CLASS} autograph-filter-input`}
          aria-label="Filter signed autographs"
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as ArchiveSort)}
          className={`${INPUT_CLASS} autograph-sort-select`}
          aria-label="Sort signed autographs"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>
      {archive.length === 0 ? (
        <p className="app-copy-soft text-sm autograph-empty">{t("autograph.empty.archive")}</p>
      ) : (
        archive.map((item) => (
          <article
            key={item.id}
            className={`autograph-archive-card ${lastSignedRequestId === item.id ? "is-highlight" : ""}`}
            data-testid="signed-request-card"
          >
            <div className="autograph-request-card-header">
              <p className="text-sm font-medium">
              {item.requesterDisplayName} ↔ {item.signerDisplayName}
            </p>
              <StatusPill status={item.status} />
            </div>
            <p className="autograph-request-pair">{rolePairLabel(item)}</p>
            <p className="text-xs app-copy-soft">{item.message}</p>
            <blockquote className="autograph-signature-quote">“{item.signatureText}”</blockquote>
            <p className="autograph-request-time">Signed {formatRelativeDate(item.signedAt ?? item.createdAt)}</p>
          </article>
        ))
      )}
    </section>
  );
}

export default function AutographExchangePage() {
  const { t } = useI18n();
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const userId = session?.user?.id;
  const {
    myProfile,
    availableSigners,
    inbox,
    outbox,
    archive,
    loading,
    error,
    busyAction,
    saveProfile,
    requestAutograph,
    signAutograph,
  } = useAutographExchange(userId);

  const [profileForm, setProfileForm] = useState<{ displayName: string; role: AutographRole }>({
    displayName: "",
    role: "student",
  });
  const [requestForm, setRequestForm] = useState({ signerUserId: "", message: "" });
  const [signatureDrafts, setSignatureDrafts] = useState<Record<string, string>>({});
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null);
  const [archiveFilter, setArchiveFilter] = useState("");
  const [archiveSort, setArchiveSort] = useState<ArchiveSort>("newest");
  const [lastSignedRequestId, setLastSignedRequestId] = useState<string | null>(null);

  const roleOptions = useMemo(
    () => [
      { value: "student" as const, label: t("autograph.profile.role.student") },
      { value: "teacher" as const, label: t("autograph.profile.role.teacher") },
    ],
    [t],
  );

  const filteredArchive = useMemo(() => {
    const normalized = archiveFilter.trim().toLowerCase();
    const base = archive.filter((item) => {
      if (!normalized) return true;
      return (
        item.requesterDisplayName.toLowerCase().includes(normalized)
        || item.signerDisplayName.toLowerCase().includes(normalized)
        || item.message.toLowerCase().includes(normalized)
        || (item.signatureText ?? "").toLowerCase().includes(normalized)
      );
    });

    return [...base].sort((a, b) => {
      const left = new Date(a.signedAt ?? a.createdAt).getTime();
      const right = new Date(b.signedAt ?? b.createdAt).getTime();
      return archiveSort === "newest" ? right - left : left - right;
    });
  }, [archive, archiveFilter, archiveSort]);

  useEffect(() => {
    if (!lastSignedRequestId) return;
    const timer = window.setTimeout(() => setLastSignedRequestId(null), 2200);
    return () => window.clearTimeout(timer);
  }, [lastSignedRequestId]);

  if (!mounted || status === "loading") {
    return <LoadingState t={t} />;
  }

  if (!userId) {
    return <SignedOutState t={t} />;
  }

  const effectiveProfileName = myProfile?.displayName ?? session.user?.name ?? session.user?.email ?? "";
  const effectiveProfileRole = myProfile?.role ?? "student";

  async function handleProfileSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const displayName = (profileForm.displayName || effectiveProfileName).trim();
    const role = profileForm.role || effectiveProfileRole;
    try {
      await saveProfile({ displayName, role });
    } catch {
      return;
    }
    setProfileForm({ displayName: "", role });
  }

  async function handleRequestSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await requestAutograph(requestForm);
    } catch {
      return;
    }
    setRequestForm({ signerUserId: "", message: "" });
  }

  async function handleSign(requestId: string) {
    try {
      await signAutograph({
        requestId,
        signatureText: signatureDrafts[requestId] ?? "",
      });
    } catch {
      return;
    }
    setSignatureDrafts((prev) => {
      const next = { ...prev };
      delete next[requestId];
      return next;
    });
    setExpandedRequestId(null);
    setLastSignedRequestId(requestId);
  }

  return (
    <ModuleLayout titleKey="module.autograph.title">
      <div className="max-w-6xl mx-auto grid gap-6 autograph-shell">
        {error ? <p className="app-alert-error text-sm p-3 rounded-lg">{error}</p> : null}

        <section className="autograph-hero" aria-label="Autograph dashboard summary">
          <div className="autograph-hero-copy">
            <p className="autograph-hero-kicker">Autograph Exchange</p>
            <h2 className="autograph-hero-title">Sign with intention, archive with pride</h2>
          </div>
          <div className="autograph-hero-stats">
            <article className="autograph-stat autograph-stat-sent autograph-tone-sent">
              <span className="autograph-stat-label">Requests you sent</span>
              <span className="autograph-stat-value">{outbox.length}</span>
            </article>
            <article className="autograph-stat autograph-stat-inbox autograph-tone-inbox">
              <span className="autograph-stat-label">Requests for you</span>
              <span className="autograph-stat-value">{inbox.length}</span>
            </article>
            <article className="autograph-stat autograph-stat-archive autograph-tone-archive">
              <span className="autograph-stat-label">Signed autographs</span>
              <span className="autograph-stat-value">{archive.length}</span>
            </article>
          </div>
        </section>

        <ProfileSection
          t={t}
          roleOptions={roleOptions}
          profileForm={profileForm}
          setProfileForm={setProfileForm}
          effectiveProfileName={effectiveProfileName}
          effectiveProfileRole={effectiveProfileRole}
          busyAction={busyAction}
          onSubmit={handleProfileSubmit}
        />

        <RequestSection
          t={t}
          requestForm={requestForm}
          setRequestForm={setRequestForm}
          availableSigners={availableSigners}
          hasProfile={Boolean(myProfile)}
          loading={loading}
          busyAction={busyAction}
          onSubmit={handleRequestSubmit}
        />

        <div className="autograph-lanes" data-testid="autograph-lanes">
          <InboxColumn
            t={t}
            inbox={inbox}
            signatureDrafts={signatureDrafts}
            setSignatureDrafts={setSignatureDrafts}
            busyAction={busyAction}
            expandedRequestId={expandedRequestId}
            setExpandedRequestId={setExpandedRequestId}
            lastSignedRequestId={lastSignedRequestId}
            onSign={handleSign}
          />
          <ArchiveColumn
            t={t}
            archive={filteredArchive}
            filter={archiveFilter}
            setFilter={setArchiveFilter}
            sort={archiveSort}
            setSort={setArchiveSort}
            lastSignedRequestId={lastSignedRequestId}
          />
        </div>

        <OutboxColumn t={t} outbox={outbox} />
      </div>
    </ModuleLayout>
  );
}
