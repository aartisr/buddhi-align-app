"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import ModuleLayout from "@/app/components/ModuleLayout";
import { useI18n } from "@/app/i18n/provider";
import { useAutographExchange } from "@/app/hooks/useAutographExchange";
import type { AutographProfile, AutographRequest, AutographRole } from "@/app/lib/autographs/types";

const INPUT_CLASS =
  "app-form-input border-2 border-primary bg-surface rounded-xl px-3 py-2 w-full max-w-full min-w-0 focus:outline-none focus:ring-2 focus:ring-primary text-base shadow-sm";

type Translate = ReturnType<typeof useI18n>["t"];

type ProfileFormState = { displayName: string; role: AutographRole };
type RequestFormState = { signerUserId: string; message: string };

type RoleOption = { value: AutographRole; label: string };

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
            {busyAction === "request" ? t("autograph.request.submitting") : t("autograph.request.submit")}
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
  onSign,
}: {
  t: Translate;
  inbox: AutographRequest[];
  signatureDrafts: Record<string, string>;
  setSignatureDrafts: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  busyAction: string | null;
  onSign: (requestId: string) => Promise<void>;
}) {
  return (
    <section className="app-surface-card p-4 rounded-2xl grid gap-3">
      <h3 className="font-semibold">{t("autograph.inbox.title")}</h3>
      {inbox.length === 0 ? (
        <p className="app-copy-soft text-sm">{t("autograph.empty.inbox")}</p>
      ) : (
        inbox.map((item) => (
          <article key={item.id} className="border border-(--border-soft) rounded-xl p-3 grid gap-2">
            <p className="text-sm font-medium">{item.requesterDisplayName}</p>
            <p className="text-xs app-copy-soft">{item.message}</p>
            <label className="flex flex-col gap-1">
              <span className="app-form-label">{t("autograph.sign.label")}</span>
              <textarea
                className={INPUT_CLASS}
                rows={2}
                value={signatureDrafts[item.id] ?? ""}
                placeholder={t("autograph.sign.placeholder")}
                onChange={(e) => setSignatureDrafts((prev) => ({ ...prev, [item.id]: e.target.value }))}
              />
            </label>
            <button className="app-button-primary" onClick={() => void onSign(item.id)} disabled={busyAction === `sign:${item.id}`}>
              {t("autograph.sign.submit")}
            </button>
          </article>
        ))
      )}
    </section>
  );
}

function OutboxColumn({ t, outbox }: { t: Translate; outbox: AutographRequest[] }) {
  return (
    <section className="app-surface-card p-4 rounded-2xl grid gap-3">
      <h3 className="font-semibold">{t("autograph.outbox.title")}</h3>
      {outbox.length === 0 ? (
        <p className="app-copy-soft text-sm">{t("autograph.empty.outbox")}</p>
      ) : (
        outbox.map((item) => (
          <article key={item.id} className="border border-(--border-soft) rounded-xl p-3 grid gap-1">
            <p className="text-sm font-medium">{item.signerDisplayName}</p>
            <p className="text-xs app-copy-soft">{item.message}</p>
            <p className="text-xs text-amber-700">{t("autograph.status.pending")}</p>
          </article>
        ))
      )}
    </section>
  );
}

function ArchiveColumn({ t, archive }: { t: Translate; archive: AutographRequest[] }) {
  return (
    <section className="app-surface-card p-4 rounded-2xl grid gap-3">
      <h3 className="font-semibold">{t("autograph.archive.title")}</h3>
      {archive.length === 0 ? (
        <p className="app-copy-soft text-sm">{t("autograph.empty.archive")}</p>
      ) : (
        archive.map((item) => (
          <article key={item.id} className="border border-(--border-soft) rounded-xl p-3 grid gap-1">
            <p className="text-sm font-medium">
              {item.requesterDisplayName} ↔ {item.signerDisplayName}
            </p>
            <p className="text-xs app-copy-soft">{item.message}</p>
            <p className="text-sm">{item.signatureText}</p>
            <p className="text-xs text-emerald-700">{t("autograph.status.signed")}</p>
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

  const roleOptions = useMemo(
    () => [
      { value: "student" as const, label: t("autograph.profile.role.student") },
      { value: "teacher" as const, label: t("autograph.profile.role.teacher") },
    ],
    [t],
  );

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
  }

  return (
    <ModuleLayout titleKey="module.autograph.title">
      <div className="max-w-6xl mx-auto grid gap-6">
        {error ? <p className="app-alert-error text-sm p-3 rounded-lg">{error}</p> : null}

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

        <div className="grid lg:grid-cols-3 gap-4">
          <InboxColumn
            t={t}
            inbox={inbox}
            signatureDrafts={signatureDrafts}
            setSignatureDrafts={setSignatureDrafts}
            busyAction={busyAction}
            onSign={handleSign}
          />
          <OutboxColumn t={t} outbox={outbox} />
          <ArchiveColumn t={t} archive={archive} />
        </div>
      </div>
    </ModuleLayout>
  );
}
