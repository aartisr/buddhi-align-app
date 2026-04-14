import { createDataProvider } from "@buddhi-align/data-access";
import type { ModuleEntry } from "@buddhi-align/data-access";
import {
  AUTOGRAPH_PROFILES_MODULE,
  AUTOGRAPH_REQUESTS_MODULE,
  type AutographProfile,
  type AutographRequest,
  type AutographRole,
  type CreateAutographRequestInput,
  type SignAutographRequestInput,
  type UpsertAutographProfileInput,
} from "./types";

type ProfileEntry = ModuleEntry & {
  userId: string;
  displayName: string;
  role: AutographRole;
  updatedAt: string;
};

type RequestEntry = ModuleEntry & {
  requesterUserId: string;
  requesterDisplayName: string;
  requesterRole: AutographRole;
  signerUserId: string;
  signerDisplayName: string;
  signerRole: AutographRole;
  message: string;
  status: "pending" | "signed";
  signatureText?: string;
  createdAt: string;
  signedAt?: string;
};

function isRole(value: unknown): value is AutographRole {
  return value === "student" || value === "teacher";
}

function sanitizeDisplayName(value: string): string {
  return value.trim().slice(0, 80);
}

function sanitizeMessage(value: string): string {
  return value.trim().slice(0, 600);
}

function sanitizeSignature(value: string): string {
  return value.trim().slice(0, 240);
}

function normalizeProfile(entry: Partial<ProfileEntry>): AutographProfile | null {
  if (!entry.id || !entry.userId || !entry.displayName || !isRole(entry.role)) {
    return null;
  }

  return {
    id: entry.id,
    userId: entry.userId,
    displayName: entry.displayName,
    role: entry.role,
    updatedAt: entry.updatedAt || new Date(0).toISOString(),
  };
}

function normalizeRequest(entry: Partial<RequestEntry>): AutographRequest | null {
  if (
    !entry.id ||
    !entry.requesterUserId ||
    !entry.requesterDisplayName ||
    !isRole(entry.requesterRole) ||
    !entry.signerUserId ||
    !entry.signerDisplayName ||
    !isRole(entry.signerRole) ||
    !entry.message ||
    (entry.status !== "pending" && entry.status !== "signed") ||
    !entry.createdAt
  ) {
    return null;
  }

  return {
    id: entry.id,
    requesterUserId: entry.requesterUserId,
    requesterDisplayName: entry.requesterDisplayName,
    requesterRole: entry.requesterRole,
    signerUserId: entry.signerUserId,
    signerDisplayName: entry.signerDisplayName,
    signerRole: entry.signerRole,
    message: entry.message,
    status: entry.status,
    signatureText: entry.signatureText,
    createdAt: entry.createdAt,
    signedAt: entry.signedAt,
  };
}

export async function listAutographProfiles(): Promise<AutographProfile[]> {
  const provider = createDataProvider();
  const entries = await provider.list<ProfileEntry>(AUTOGRAPH_PROFILES_MODULE);

  return entries
    .map((entry) => normalizeProfile(entry))
    .filter((entry): entry is AutographProfile => Boolean(entry))
    .sort((a, b) => a.displayName.localeCompare(b.displayName));
}

export async function upsertAutographProfile(
  actorUserId: string,
  input: UpsertAutographProfileInput,
): Promise<AutographProfile> {
  const provider = createDataProvider();
  const displayName = sanitizeDisplayName(input.displayName);

  if (!displayName) {
    throw new Error("Display name is required.");
  }

  if (!isRole(input.role)) {
    throw new Error("Role must be student or teacher.");
  }

  const now = new Date().toISOString();
  const existing = (await provider.list<ProfileEntry>(AUTOGRAPH_PROFILES_MODULE, { userId: actorUserId })).find(
    (entry) => entry.userId === actorUserId,
  );

  if (existing?.id) {
    const updated = await provider.update<ProfileEntry>(
      AUTOGRAPH_PROFILES_MODULE,
      existing.id,
      {
        displayName,
        role: input.role,
        updatedAt: now,
      },
      { userId: actorUserId },
    );
    const normalized = normalizeProfile(updated);
    if (!normalized) {
      throw new Error("Unable to save profile.");
    }
    return normalized;
  }

  const created = await provider.create<ProfileEntry>(
    AUTOGRAPH_PROFILES_MODULE,
    {
      userId: actorUserId,
      displayName,
      role: input.role,
      updatedAt: now,
    },
    { userId: actorUserId },
  );

  const normalized = normalizeProfile(created);
  if (!normalized) {
    throw new Error("Unable to create profile.");
  }
  return normalized;
}

export async function listVisibleAutographRequests(actorUserId: string): Promise<AutographRequest[]> {
  const provider = createDataProvider();
  const entries = await provider.list<RequestEntry>(AUTOGRAPH_REQUESTS_MODULE);

  return entries
    .map((entry) => normalizeRequest(entry))
    .filter((entry): entry is AutographRequest => Boolean(entry))
    .filter((entry) => entry.requesterUserId === actorUserId || entry.signerUserId === actorUserId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createAutographRequest(
  actorUserId: string,
  input: CreateAutographRequestInput,
): Promise<AutographRequest> {
  const provider = createDataProvider();
  const signerUserId = input.signerUserId.trim();
  const message = sanitizeMessage(input.message);

  if (!signerUserId) {
    throw new Error("Signer is required.");
  }

  if (!message) {
    throw new Error("Message is required.");
  }

  if (signerUserId === actorUserId) {
    throw new Error("You cannot request your own autograph.");
  }

  const profiles = await listAutographProfiles();
  const requesterProfile = profiles.find((profile) => profile.userId === actorUserId);
  const signerProfile = profiles.find((profile) => profile.userId === signerUserId);

  if (!requesterProfile) {
    throw new Error("Please save your autograph profile first.");
  }

  if (!signerProfile) {
    throw new Error("The selected signer does not have an autograph profile yet.");
  }

  const created = await provider.create<RequestEntry>(AUTOGRAPH_REQUESTS_MODULE, {
    requesterUserId: actorUserId,
    requesterDisplayName: requesterProfile.displayName,
    requesterRole: requesterProfile.role,
    signerUserId,
    signerDisplayName: signerProfile.displayName,
    signerRole: signerProfile.role,
    message,
    status: "pending",
    createdAt: new Date().toISOString(),
  });

  const normalized = normalizeRequest(created);
  if (!normalized) {
    throw new Error("Unable to create autograph request.");
  }
  return normalized;
}

export async function signAutographRequest(
  actorUserId: string,
  requestId: string,
  input: SignAutographRequestInput,
): Promise<AutographRequest> {
  const provider = createDataProvider();
  const signatureText = sanitizeSignature(input.signatureText);

  if (!signatureText) {
    throw new Error("Signature text is required.");
  }

  const allRequests = await provider.list<RequestEntry>(AUTOGRAPH_REQUESTS_MODULE);
  const current = allRequests.find((entry) => entry.id === requestId);

  if (!current) {
    throw new Error("Request not found.");
  }

  if (current.signerUserId !== actorUserId) {
    throw new Error("Only the requested signer can sign this autograph.");
  }

  if (current.status !== "pending") {
    throw new Error("This autograph request has already been signed.");
  }

  const updated = await provider.update<RequestEntry>(AUTOGRAPH_REQUESTS_MODULE, requestId, {
    status: "signed",
    signatureText,
    signedAt: new Date().toISOString(),
  });

  const normalized = normalizeRequest(updated);
  if (!normalized) {
    throw new Error("Unable to sign autograph request.");
  }

  return normalized;
}
