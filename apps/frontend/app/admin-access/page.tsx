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
        <h1 className="app-panel-title text-2xl font-bold mb-2">Admin Access</h1>
        <p className="app-copy-soft mb-6">
          Enter the admin password to unlock the protected admin module.
        </p>

        {!configured ? (
          <p className="app-alert-error text-sm p-3 rounded-lg" role="alert">
            Admin access is not configured. Set ADMIN_PASSWORD in environment variables.
          </p>
        ) : (
          <form action={unlockAdmin} className="space-y-4">
            <input type="hidden" name="callbackUrl" value={callbackUrl} />
            <div>
              <label htmlFor="admin-password" className="block text-sm font-medium mb-1">Password</label>
              <input
                id="admin-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="app-input w-full"
                placeholder="Enter admin password"
              />
            </div>

            {hasError ? (
              <p className="app-alert-error text-sm p-3 rounded-lg" role="alert">
                Invalid admin password.
              </p>
            ) : null}

            <button type="submit" className="app-button-primary w-full">
              Unlock Admin Module
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
