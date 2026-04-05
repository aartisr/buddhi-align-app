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
    <div className="flex items-center gap-1.5 sm:gap-2">
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
        className="text-xs px-2 py-1 rounded app-user-action app-user-action--mobile-icon transition-colors"
        aria-label={t("auth.signOut")}
      >
        <span className="app-user-action__icon" aria-hidden>
          <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" focusable="false">
            <path d="M7.5 4.16666H5.83333C5.39131 4.16666 4.96738 4.34225 4.65482 4.65481C4.34226 4.96737 4.16667 5.3913 4.16667 5.83332V14.1667C4.16667 14.6087 4.34226 15.0326 4.65482 15.3452C4.96738 15.6577 5.39131 15.8333 5.83333 15.8333H7.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M11.6667 12.5L15 9.99998L11.6667 7.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M15 10H7.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
        <span className="hidden sm:inline">{t("auth.signOut")}</span>
      </button>
    </div>
  );
}
