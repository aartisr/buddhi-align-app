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
    }),
  "microsoft-entra-id": () =>
    MicrosoftEntraId({
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID,
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_SECRET,
      issuer: process.env.AUTH_MICROSOFT_ENTRA_TENANT_ID
        ? `https://login.microsoftonline.com/${process.env.AUTH_MICROSOFT_ENTRA_TENANT_ID}/v2.0`
        : "https://login.microsoftonline.com/common/v2.0",
    }),
  github: () =>
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
  apple: () =>
    Apple({
      clientId: process.env.AUTH_APPLE_ID,
      clientSecret: process.env.AUTH_APPLE_SECRET,
    }),
  facebook: () =>
    Facebook({
      clientId: process.env.AUTH_FACEBOOK_ID,
      clientSecret: process.env.AUTH_FACEBOOK_SECRET,
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

  pages: {
    signIn: "/sign-in",
  },

  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      if (session.user && token.provider) {
        (session.user as typeof session.user & { provider?: string }).provider = token.provider as string;
      }
      return session;
    },
    async jwt({ token, account }) {
      if (account?.provider) token.provider = account.provider;
      return token;
    },
  },

  session: {
    strategy: "jwt",
  },
});
