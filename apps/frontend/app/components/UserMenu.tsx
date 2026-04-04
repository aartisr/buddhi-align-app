"use client";

import { ANONYMOUS_COOKIE_NAME, ANONYMOUS_COOKIE_VALUE } from "@/app/auth/anonymous";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useI18n } from "../i18n/provider";

/**
 * Displays the signed-in user's avatar + name and a sign-out button.
 * Renders nothing while the session is loading.
 * When no session exists, shows a sign-in link instead.
 */
export default function UserMenu() {
  const { data: session, status } = useSession();
  const { t } = useI18n();
  const [isAnonymous, setIsAnonymous] = useState(false);

  useEffect(() => {
    if (typeof document === "undefined") return;
    setIsAnonymous(document.cookie.includes(`${ANONYMOUS_COOKIE_NAME}=${ANONYMOUS_COOKIE_VALUE}`));
  }, []);

  if (status === "loading") {
    return <div className="w-8 h-8 rounded-full app-user-skeleton animate-pulse" aria-label="Loading session" />;
  }

  if (!session) {
    return (
      <div className="flex items-center gap-2">
        {isAnonymous && (
          <span className="text-xs px-2 py-1 rounded-full app-anonymous-badge">
            {t("auth.anonymousBadge")}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {session.user?.image ? (
        <Image
          src={session.user.image}
          alt={session.user.name ?? "User avatar"}
          width={32}
          height={32}
          className="rounded-full app-user-avatar-ring"
        />
      ) : (
        <div className="w-8 h-8 rounded-full app-user-avatar-fallback flex items-center justify-center text-sm font-bold">
          {(session.user?.name ?? session.user?.email ?? "?")[0].toUpperCase()}
        </div>
      )}
      <span className="text-sm font-medium hidden sm:inline app-user-name max-w-30 truncate">
        {session.user?.name ?? session.user?.email}
      </span>
      <button
        onClick={() => signOut({ callbackUrl: "/sign-in" })}
        className="text-xs px-2 py-1 rounded app-user-action transition-colors"
        aria-label={t("auth.signOut")}
      >
        {t("auth.signOut")}
      </button>
    </div>
  );
}
