"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { apiFetch } from "@buddhi-align/site-config";
import type {
  AutographProfile,
  AutographRequest,
  AutographRole,
} from "@/app/lib/autographs/types";

interface SaveProfileInput {
  displayName: string;
  role: AutographRole;
}

interface CreateRequestInput {
  signerUserId: string;
  message: string;
}

interface SignRequestInput {
  requestId: string;
  signatureText: string;
}

export function useAutographExchange(currentUserId?: string) {
  const [profiles, setProfiles] = useState<AutographProfile[]>([]);
  const [requests, setRequests] = useState<AutographRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!currentUserId) {
      setProfiles([]);
      setRequests([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [profileData, requestData] = await Promise.all([
        apiFetch<AutographProfile[]>("/api/autographs/profiles"),
        apiFetch<AutographRequest[]>("/api/autographs/requests"),
      ]);
      setProfiles(Array.isArray(profileData) ? profileData : []);
      setRequests(Array.isArray(requestData) ? requestData : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load autograph exchange.");
    } finally {
      setLoading(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    void load();
  }, [load]);

  const myProfile = useMemo(
    () => profiles.find((profile) => profile.userId === currentUserId) ?? null,
    [profiles, currentUserId],
  );

  const availableSigners = useMemo(
    () => profiles.filter((profile) => profile.userId !== currentUserId),
    [profiles, currentUserId],
  );

  const inbox = useMemo(
    () => requests.filter((item) => item.signerUserId === currentUserId && item.status === "pending"),
    [requests, currentUserId],
  );

  const outbox = useMemo(
    () => requests.filter((item) => item.requesterUserId === currentUserId && item.status === "pending"),
    [requests, currentUserId],
  );

  const archive = useMemo(
    () => requests.filter((item) => item.status === "signed"),
    [requests],
  );

  const saveProfile = useCallback(
    async (input: SaveProfileInput) => {
      setBusyAction("profile");
      setError(null);
      try {
        const profile = await apiFetch<AutographProfile>("/api/autographs/profiles", {
          method: "PUT",
          body: JSON.stringify(input),
        });

        setProfiles((prev) => {
          const existingIndex = prev.findIndex((item) => item.userId === profile.userId);
          if (existingIndex < 0) {
            return [...prev, profile].sort((a, b) => a.displayName.localeCompare(b.displayName));
          }

          const updated = [...prev];
          updated[existingIndex] = profile;
          return updated.sort((a, b) => a.displayName.localeCompare(b.displayName));
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to save profile.");
        throw err;
      } finally {
        setBusyAction(null);
      }
    },
    [],
  );

  const requestAutograph = useCallback(
    async (input: CreateRequestInput) => {
      setBusyAction("request");
      setError(null);
      try {
        const signerUserId = input.signerUserId.trim();
        const message = input.message.trim();

        if (!myProfile) {
          throw new Error("Please save your autograph profile first.");
        }

        if (!signerUserId) {
          throw new Error("Signer is required.");
        }

        if (!message) {
          throw new Error("Message is required.");
        }

        if (!profiles.some((profile) => profile.userId === signerUserId)) {
          throw new Error("The selected signer does not have an autograph profile yet.");
        }

        const created = await apiFetch<AutographRequest>("/api/autographs/requests", {
          method: "POST",
          body: JSON.stringify({
            signerUserId,
            message,
          }),
        });
        setRequests((prev) => [created, ...prev]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to create autograph request.");
        throw err;
      } finally {
        setBusyAction(null);
      }
    },
    [myProfile, profiles],
  );

  const signAutograph = useCallback(
    async (input: SignRequestInput) => {
      setBusyAction(`sign:${input.requestId}`);
      setError(null);
      try {
        const updated = await apiFetch<AutographRequest>(
          `/api/autographs/requests/${encodeURIComponent(input.requestId)}/sign`,
          {
            method: "POST",
            body: JSON.stringify({ signatureText: input.signatureText }),
          },
        );

        setRequests((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to sign autograph request.");
        throw err;
      } finally {
        setBusyAction(null);
      }
    },
    [],
  );

  return {
    profiles,
    requests,
    myProfile,
    availableSigners,
    inbox,
    outbox,
    archive,
    loading,
    error,
    busyAction,
    reload: load,
    saveProfile,
    requestAutograph,
    signAutograph,
  };
}
