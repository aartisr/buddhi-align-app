import { signIn } from "@/auth";
import { getAnonymousCookieClearOptions, getAnonymousCookieOptions } from "@/app/auth/anonymous";
import { getRelativeCallbackUrlFromReferer, sanitizeRelativeCallbackUrl } from "@/app/auth/navigation";
import { translate, DEFAULT_LOCALE, MODULE_CATALOG, type TranslationKey } from "@/app/i18n/config";
import {
  getConfiguredOAuthProviders,
  type OAuthProviderId,
} from "@/app/auth/provider-catalog";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import EasyInviteCard from "@/app/components/EasyInviteCard";

/** Brand colours for providers */
const PROVIDER_THEME: Record<
  OAuthProviderId,
  {
    variant?: "deep";
    icon: ReactNode;
  }
> = {
  google: {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
    ),
  },
  "microsoft-entra-id": {
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 23 23" aria-hidden="true">
        <path fill="#f3f3f3" d="M0 0h23v23H0z" />
        <path fill="#f35325" d="M1 1h10v10H1z" />
        <path fill="#81bc06" d="M12 1h10v10H12z" />
        <path fill="#05a6f0" d="M1 12h10v10H1z" />
        <path fill="#ffba08" d="M12 12h10v10H12z" />
      </svg>
    ),
  },
  github: {
    variant: "deep",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
      </svg>
    ),
  },
  apple: {
    variant: "deep",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
      </svg>
    ),
  },
  facebook: {
    variant: "deep",
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
};

const t = (key: TranslationKey, vars?: Record<string, string | number>) =>
  translate(DEFAULT_LOCALE, key, vars);

function sanitizeChoiceMode(mode?: string): "manual" | "auto" {
  return mode === "manual" ? "manual" : "auto";
}

function buildOAuthStartPath(providerId: OAuthProviderId, callbackUrl: string): string {
  const params = new URLSearchParams();
  params.set("callbackUrl", callbackUrl);
  return `/api/auth/signin/${providerId}?${params.toString()}`;
}

function firstHeaderValue(value: string | null): string | undefined {
  return value?.split(",")[0]?.trim() || undefined;
}

function getRequestOrigin(): string | undefined {
  const headerList = headers();
  const host = firstHeaderValue(headerList.get("x-forwarded-host")) ?? firstHeaderValue(headerList.get("host"));
  if (!host) return undefined;

  const protocol = firstHeaderValue(headerList.get("x-forwarded-proto")) ?? (host.startsWith("localhost") ? "http" : "https");
  return `${protocol}://${host}`;
}

function getSignInErrorMessage(error: string): string {
  if (error === "OAuthSignin" || error === "OAuthCallback") {
    return t("auth.error.signInFailed");
  }
  if (error === "OIDCRequired") {
    return t("auth.error.oidcRequired");
  }
  if (error === "StepUpRequired") {
    return t("auth.error.stepUpRequired");
  }
  return t("auth.error.generic", { error });
}

export default function SignInPage({
  searchParams,
}: {
  searchParams?: { callbackUrl?: string; error?: string; mode?: string };
}) {
  const configuredProviders = getConfiguredOAuthProviders();
  const requestOrigin = getRequestOrigin();
  const refererFallback = getRelativeCallbackUrlFromReferer(headers().get("referer"), requestOrigin, "/");
  const callbackUrl = sanitizeRelativeCallbackUrl(searchParams?.callbackUrl, refererFallback, {
    origin: requestOrigin,
  });
  const mode = sanitizeChoiceMode(searchParams?.mode);
  const error = searchParams?.error;
  const inviteModuleOptions = MODULE_CATALOG.map((item) => ({
    key: item.key,
    href: item.href,
    label: t(item.navKey ?? item.titleKey),
  }));

  if (!error && mode !== "manual" && configuredProviders.length === 1) {
    redirect(buildOAuthStartPath(configuredProviders[0].id, callbackUrl));
  }

  return (
    <div className="app-signin-shell min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🧘</div>
          <h1 className="app-page-title text-3xl font-bold tracking-tight">
            {t("app.brand")}
          </h1>
          <p className="app-signin-subtitle mt-2 text-sm">
            {t("auth.chooseProvider")}
          </p>
          {configuredProviders.length === 1 ? (
            <p className="app-copy-soft text-xs mt-2">
              {t("auth.instantAccess")}. {t("auth.instantAccessBody")}
            </p>
          ) : null}
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-lg text-sm text-center app-alert-error__text app-alert-error" role="alert">
            {getSignInErrorMessage(error)}
          </div>
        )}

        {/* Provider buttons */}
        <div className="app-signin-card rounded-2xl p-6 space-y-3">
          <p className="app-copy-subtle text-xs text-center uppercase tracking-widest font-medium mb-4">
            {t("auth.signIn")}
          </p>

          <div className="app-anonymous-callout rounded-xl p-4 mb-4" role="note" aria-label={t("auth.anonymousWarningTitle")}>
            <p className="app-anonymous-title text-sm font-semibold">
              {t("auth.anonymousWarningTitle")}
            </p>
            <p className="app-anonymous-copy text-xs mt-1">
              {t("auth.anonymousWarningBody")}
            </p>
            <form
              className="mt-3"
              action={async () => {
                "use server";
                cookies().set(getAnonymousCookieOptions());
                redirect(callbackUrl);
              }}
            >
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-150 app-anonymous-button shadow-sm hover:shadow-md active:scale-[0.98]"
              >
                <span aria-hidden>🕊️</span>
                <span>{t("auth.continueAnonymously")}</span>
              </button>
            </form>
          </div>

          {configuredProviders.map((provider) => {
            const theme = PROVIDER_THEME[provider.id];
            const providerClass = theme.variant === "deep" ? "app-provider-btn app-provider-btn--deep" : "app-provider-btn";

            return (
              <form
                key={provider.id}
                action={async () => {
                  "use server";
                  cookies().set(getAnonymousCookieClearOptions());
                  await signIn(provider.id, { redirectTo: callbackUrl });
                }}
              >
                <button
                  type="submit"
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-150 shadow-sm hover:shadow-md active:scale-[0.98] ${providerClass}`}
                >
                  <span className="shrink-0">{theme.icon}</span>
                  <span className="flex-1 text-left">
                    {t("auth.signInWith", { provider: provider.name })}
                  </span>
                </button>
              </form>
            );
          })}

          {configuredProviders.length === 0 && (
            <p className="app-copy-soft text-sm text-center py-2">
              {t("auth.noProviders")}
            </p>
          )}

          <p className="app-copy-subtle text-[11px] leading-relaxed text-center pt-2">
            {t("auth.persistHint")}
          </p>

          {configuredProviders.length === 1 ? (
            <p className="text-center pt-2">
              <a
                href={`/sign-in?mode=manual&callbackUrl=${encodeURIComponent(callbackUrl)}`}
                className="app-copy-soft text-xs underline underline-offset-2"
              >
                {t("auth.instantAccessManage")}
              </a>
            </p>
          ) : null}
        </div>

        <div className="mt-6">
          <EasyInviteCard
            title={t("invite.title")}
            subtitle={t("invite.subtitle")}
            moduleOptions={inviteModuleOptions}
            moduleSelectorLabel={t("invite.moduleSelector")}
            homeOptionLabel={t("invite.homeOption")}
            emailFieldLabel={t("invite.emailOptional")}
            phoneFieldLabel={t("invite.phoneOptional")}
            emailPlaceholder={t("invite.emailPlaceholder")}
            phonePlaceholder={t("invite.phonePlaceholder")}
            emailCta={t("invite.email")}
            smsCta={t("invite.sms")}
            copyCta={t("invite.copy")}
            shareCta={t("invite.share")}
            copiedLabel={t("invite.copied")}
          />
        </div>

        {/* Footer note */}
        <p className="app-copy-subtle mt-6 text-center text-xs">
          {t("footer.dedicatedTo")}{" "}
          <span className="app-inline-brand font-medium">{t("footer.schoolName")}</span>.{" "}
          <a href="/autograph-exchange" className="underline underline-offset-2">
            {t("footer.gratitude")}
          </a>
        </p>
      </div>
    </div>
  );
}
