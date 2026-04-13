import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import {
  ADMIN_COOKIE_NAME,
  createAdminSessionValue,
  isAdminConfigured,
  isAdminCookieValid,
  verifyAdminPassword,
} from "@/app/auth/admin";
import { hasOidcConfidence } from "@/app/auth/auth-confidence";
import { writeAdminAudit } from "@/app/admin/_audit";
import { translate, DEFAULT_LOCALE, type TranslationKey } from "@/app/i18n/config";

const t = (key: TranslationKey, vars?: Record<string, string | number>) =>
  translate(DEFAULT_LOCALE, key, vars);

function sanitizeCallbackUrl(callbackUrl?: string): string {
  if (!callbackUrl || !callbackUrl.startsWith("/") || callbackUrl.startsWith("//")) {
    return "/admin";
  }
  return callbackUrl;
}

export default async function AdminAccessPage({
  searchParams,
}: {
  searchParams?: { callbackUrl?: string; error?: string };
}) {
  const session = await auth();
  if (!session) {
    redirect("/sign-in?callbackUrl=%2Fadmin-access");
  }
  if (!hasOidcConfidence(session)) {
    redirect("/sign-in?callbackUrl=%2Fadmin-access&error=OIDCRequired");
  }

  const callbackUrl = sanitizeCallbackUrl(searchParams?.callbackUrl);
  const existingCookie = cookies().get(ADMIN_COOKIE_NAME)?.value;
  if (isAdminCookieValid(existingCookie)) {
    redirect(callbackUrl);
  }

  const configured = isAdminConfigured();
  const hasError = searchParams?.error === "invalid";

  async function unlockAdmin(formData: FormData) {
    "use server";

    const session = await auth();
    if (!session) {
      redirect("/sign-in?callbackUrl=%2Fadmin-access");
    }
    if (!hasOidcConfidence(session)) {
      redirect("/sign-in?callbackUrl=%2Fadmin-access&error=OIDCRequired");
    }

    const callback = sanitizeCallbackUrl(String(formData.get("callbackUrl") ?? "/admin"));
    const password = String(formData.get("password") ?? "");

    if (!isAdminConfigured() || !verifyAdminPassword(password)) {
      redirect(`/admin-access?error=invalid&callbackUrl=${encodeURIComponent(callback)}`);
    }

    const actorId = session?.user?.id ?? "unknown-admin";

    cookies().set({
      name: ADMIN_COOKIE_NAME,
      value: createAdminSessionValue(),
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    await writeAdminAudit({
      actor: actorId,
      action: "admin.unlock",
      detail: "Admin module unlocked via password.",
      severity: "info",
    });

    redirect(callback);
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10">
      <section className="app-surface-card w-full max-w-md p-6 sm:p-8">
        <h1 className="app-panel-title text-2xl font-bold mb-2">{t("admin.access.title")}</h1>
        <p className="app-copy-soft mb-6">
          {t("admin.access.subtitle")}
        </p>

        {!configured ? (
          <p className="app-alert-error text-sm p-3 rounded-lg" role="alert">
            {t("admin.access.notConfigured")}
          </p>
        ) : (
          <form action={unlockAdmin} className="space-y-4">
            <input type="hidden" name="callbackUrl" value={callbackUrl} />
            <div>
              <label htmlFor="admin-password" className="block text-sm font-medium mb-1">{t("admin.access.passwordLabel")}</label>
              <input
                id="admin-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="app-input w-full"
                placeholder={t("admin.access.passwordPlaceholder")}
              />
            </div>

            {hasError ? (
              <p className="app-alert-error text-sm p-3 rounded-lg" role="alert">
                {t("admin.access.invalidPassword")}
              </p>
            ) : null}

            <button type="submit" className="app-button-primary w-full">
              {t("admin.access.unlock")}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
