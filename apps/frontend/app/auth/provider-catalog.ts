export type OAuthProviderId =
  | "google"
  | "microsoft-entra-id"
  | "github"
  | "apple"
  | "facebook";

export interface OAuthProviderMeta {
  id: OAuthProviderId;
  name: string;
}

type ProviderEnvSpec = Readonly<{
  id: OAuthProviderId;
  requiredEnv: readonly string[];
}>;

/**
 * Single source of truth for enabled OAuth providers.
 * Keep ordering stable so sign-in UI and backend provider setup stay aligned.
 */
export const OAUTH_PROVIDERS: readonly OAuthProviderMeta[] = [
  { id: "google", name: "Google" },
  { id: "microsoft-entra-id", name: "Microsoft" },
  { id: "github", name: "GitHub" },
  { id: "apple", name: "Apple" },
  { id: "facebook", name: "Facebook" },
] as const;

const PROVIDER_ENV_REQUIREMENTS: readonly ProviderEnvSpec[] = [
  { id: "google", requiredEnv: ["AUTH_GOOGLE_ID", "AUTH_GOOGLE_SECRET"] },
  {
    id: "microsoft-entra-id",
    requiredEnv: ["AUTH_MICROSOFT_ENTRA_ID", "AUTH_MICROSOFT_ENTRA_SECRET"],
  },
  { id: "github", requiredEnv: ["AUTH_GITHUB_ID", "AUTH_GITHUB_SECRET"] },
  { id: "apple", requiredEnv: ["AUTH_APPLE_ID", "AUTH_APPLE_SECRET"] },
  { id: "facebook", requiredEnv: ["AUTH_FACEBOOK_ID", "AUTH_FACEBOOK_SECRET"] },
] as const;

function isConfigured(requiredEnv: readonly string[]): boolean {
  return requiredEnv.every((key) => Boolean(process.env[key]));
}

export function getConfiguredOAuthProviders(): OAuthProviderMeta[] {
  const enabledIds = new Set(
    PROVIDER_ENV_REQUIREMENTS.filter((item) => isConfigured(item.requiredEnv)).map((item) => item.id),
  );

  return OAUTH_PROVIDERS.filter((provider) => enabledIds.has(provider.id));
}
