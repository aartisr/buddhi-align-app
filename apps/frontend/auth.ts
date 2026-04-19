import NextAuth from "next-auth";
import type { Provider } from "@auth/core/providers";
import Google from "next-auth/providers/google";
import MicrosoftEntraId from "next-auth/providers/microsoft-entra-id";
import GitHub from "next-auth/providers/github";
import Apple from "next-auth/providers/apple";
import Facebook from "next-auth/providers/facebook";
import {
  getConfiguredOAuthProviders,
  type OAuthProviderId,
} from "./app/auth/provider-catalog";
import { getAuthConfidenceForProvider } from "./app/auth/auth-confidence";
import { buildStableIdentityKey, resolveSessionSubject } from "./app/auth/identity";

const OIDC_BASE_SCOPE = "openid profile email";

function getValidatedAuthUrl(url?: string): string | undefined {
  if (!url) return undefined;

  try {
    const parsed = new URL(url);
    if (process.env.NODE_ENV === "production" && parsed.protocol !== "https:") {
      return undefined;
    }
    return parsed.toString();
  } catch {
    return undefined;
  }
}

function shouldIgnoreConfiguredAuthUrl(url?: string): boolean {
  if (!url || process.env.NODE_ENV === "production") {
    return false;
  }

  try {
    const parsed = new URL(url);
    return ["localhost", "127.0.0.1", "0.0.0.0"].includes(parsed.hostname);
  } catch {
    return true;
  }
}

const configuredAuthUrl = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL;

if (process.env.NODE_ENV === "production") {
  // In production, always derive Auth.js host from forwarded request headers.
  // This avoids stale/misconfigured AUTH_URL/NEXTAUTH_URL values causing localhost redirects.
  delete process.env.AUTH_URL;
  delete process.env.NEXTAUTH_URL;
} else {
  if (shouldIgnoreConfiguredAuthUrl(configuredAuthUrl)) {
    delete process.env.AUTH_URL;
    delete process.env.NEXTAUTH_URL;
    console.warn("Ignoring localhost auth URL in development and falling back to request host.");
  }

  const validatedAuthUrl = getValidatedAuthUrl(configuredAuthUrl);
  if (configuredAuthUrl && !validatedAuthUrl && !shouldIgnoreConfiguredAuthUrl(configuredAuthUrl)) {
    delete process.env.AUTH_URL;
    delete process.env.NEXTAUTH_URL;
    console.warn("Ignoring invalid auth URL and falling back to request host.");
  } else if (validatedAuthUrl && !shouldIgnoreConfiguredAuthUrl(configuredAuthUrl)) {
    process.env.AUTH_URL = validatedAuthUrl;
    process.env.NEXTAUTH_URL = validatedAuthUrl;
  }
}

/**
 * NextAuth v5 configuration with 5 OAuth providers.
 *
 * Required environment variables — see .env.example for details:
 *   AUTH_SECRET
 *   AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET
 *   AUTH_MICROSOFT_ENTRA_ID, AUTH_MICROSOFT_ENTRA_SECRET, AUTH_MICROSOFT_ENTRA_TENANT_ID (optional, defaults to "common")
 *   AUTH_GITHUB_ID, AUTH_GITHUB_SECRET
 *   AUTH_APPLE_ID, AUTH_APPLE_SECRET (p8 private key content), AUTH_APPLE_KEY_ID, AUTH_APPLE_TEAM_ID
 *   AUTH_FACEBOOK_ID, AUTH_FACEBOOK_SECRET
 */
const providerFactory: Record<OAuthProviderId, () => Provider> = {
  google: () =>
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      checks: ["pkce", "state", "nonce"],
      authorization: {
        params: {
          scope: OIDC_BASE_SCOPE,
          prompt: "select_account",
        },
      },
    }),
  "microsoft-entra-id": () =>
    MicrosoftEntraId({
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID,
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_SECRET,
      issuer: process.env.AUTH_MICROSOFT_ENTRA_TENANT_ID
        ? `https://login.microsoftonline.com/${process.env.AUTH_MICROSOFT_ENTRA_TENANT_ID}/v2.0`
        : "https://login.microsoftonline.com/common/v2.0",
      checks: ["pkce", "state", "nonce"],
      authorization: {
        params: {
          scope: `${OIDC_BASE_SCOPE} offline_access`,
        },
      },
    }),
  github: () =>
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
      authorization: {
        params: {
          scope: "read:user user:email",
        },
      },
    }),
  apple: () =>
    Apple({
      clientId: process.env.AUTH_APPLE_ID,
      clientSecret: process.env.AUTH_APPLE_SECRET,
      checks: ["state", "nonce"],
    }),
  facebook: () =>
    Facebook({
      clientId: process.env.AUTH_FACEBOOK_ID,
      clientSecret: process.env.AUTH_FACEBOOK_SECRET,
      authorization: {
        params: {
          scope: "email public_profile",
        },
      },
    }),
};

const configuredProviders = getConfiguredOAuthProviders();

if (configuredProviders.length === 0) {
  console.warn(
    "No OAuth providers are configured. Set provider credentials in .env.local (see .env.example).",
  );
}

const providers = configuredProviders.map((provider) => providerFactory[provider.id]());

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers,
  trustHost: true,

  pages: {
    signIn: "/sign-in",
  },

  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        const subject = resolveSessionSubject(token.sub, token.identityKey);
        if (subject) {
          session.user.id = subject;
        }
      }
      if (session.user && token.provider) {
        (session.user as typeof session.user & { provider?: string }).provider = token.provider as string;
      }
      if (session.user && token.identityKey) {
        (
          session.user as typeof session.user & {
            identityKey?: string;
          }
        ).identityKey = token.identityKey as string;
      }
      if (session.user && token.authConfidence) {
        (
          session.user as typeof session.user & {
            authConfidence?: string;
          }
        ).authConfidence = token.authConfidence as string;
      }
      if (session.user && token.authAt) {
        (
          session.user as typeof session.user & {
            authAt?: number;
          }
        ).authAt = token.authAt as number;
      }
      return session;
    },
    async jwt({ token, account }) {
      if (account?.provider) {
        token.provider = account.provider;
        token.authConfidence = getAuthConfidenceForProvider(account.provider);
        token.authAt = Date.now();
      }
      if (!token.authAt && typeof token.iat === "number") {
        token.authAt = token.iat * 1000;
      }
      const identityKey = buildStableIdentityKey(account?.provider, account?.providerAccountId);
      if (identityKey) {
        token.identityKey = identityKey;
      }

      const stableSubject = resolveSessionSubject(token.sub, token.identityKey);
      if (stableSubject) {
        token.sub = stableSubject;
      }
      return token;
    },
  },

  session: {
    strategy: "jwt",
  },
});
