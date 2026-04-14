import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import type { AutographRequest, AutographRole } from "@/app/lib/autographs/types";
import type { TranslationKey } from "@/app/i18n/config";
import { buildSignaturePreset } from "./signature-generator";

export type ArchiveSort = "newest" | "oldest";
export type ProfileFormState = { displayName: string; role: AutographRole };
export type RequestFormState = { signerUserId: string; message: string };
export type RoleOption = { value: AutographRole; label: string };

interface ViewModelArgs {
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
  userId?: string;
  sessionName?: string | null;
  sessionEmail?: string | null;
  profileDisplayName?: string;
  profileRole?: AutographRole;
  archive: AutographRequest[];
  saveProfile: (input: { displayName: string; role: AutographRole }) => Promise<void>;
  requestAutograph: (input: RequestFormState) => Promise<void>;
  signAutograph: (input: { requestId: string; signatureText: string }) => Promise<void>;
}

export function useAutographExchangeViewModel({
  t,
  userId,
  sessionName,
  sessionEmail,
  profileDisplayName,
  profileRole,
  archive,
  saveProfile,
  requestAutograph,
  signAutograph,
}: ViewModelArgs) {
  const [profileForm, setProfileForm] = useState<ProfileFormState>({ displayName: "", role: "student" });
  const [requestForm, setRequestForm] = useState<RequestFormState>({ signerUserId: "", message: "" });
  const [signatureDrafts, setSignatureDrafts] = useState<Record<string, string>>({});
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null);
  const [archiveFilter, setArchiveFilter] = useState("");
  const [archiveSort, setArchiveSort] = useState<ArchiveSort>("newest");
  const [lastSignedRequestId, setLastSignedRequestId] = useState<string | null>(null);

  const roleOptions = useMemo<RoleOption[]>(
    () => [
      { value: "student", label: t("autograph.profile.role.student") },
      { value: "teacher", label: t("autograph.profile.role.teacher") },
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

  const effectiveProfileName = profileDisplayName ?? sessionName ?? sessionEmail ?? "";
  const effectiveProfileRole = profileRole ?? "student";

  const signaturePreset = useMemo(
    () => buildSignaturePreset(userId ?? "anonymous", effectiveProfileName),
    [userId, effectiveProfileName],
  );

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const displayName = (profileForm.displayName || effectiveProfileName).trim();
    const role = profileForm.role || effectiveProfileRole;
    try {
      await saveProfile({ displayName, role });
      setProfileForm({ displayName: "", role });
    } catch {
      return;
    }
  }

  async function handleRequestSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await requestAutograph(requestForm);
      setRequestForm({ signerUserId: "", message: "" });
    } catch {
      return;
    }
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

  return {
    profileForm,
    setProfileForm,
    requestForm,
    setRequestForm,
    signatureDrafts,
    setSignatureDrafts,
    expandedRequestId,
    setExpandedRequestId,
    archiveFilter,
    setArchiveFilter,
    archiveSort,
    setArchiveSort,
    lastSignedRequestId,
    roleOptions,
    filteredArchive,
    signaturePreset,
    effectiveProfileName,
    effectiveProfileRole,
    handleProfileSubmit,
    handleRequestSubmit,
    handleSign,
  };
}
