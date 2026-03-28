"use client";

import { ANONYMOUS_COOKIE_NAME, ANONYMOUS_COOKIE_VALUE } from "@/app/auth/anonymous";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
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
    return <div className="w-8 h-8 rounded-full bg-zinc-200 animate-pulse" aria-label="Loading session" />;
  }

  if (!session) {
    return (
      <div className="flex items-center gap-2">
        {isAnonymous && (
          <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
            {t("auth.anonymousBadge")}
          </span>
        )}
        <Link
          href="/sign-in"
          className="text-sm font-medium px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
        >
          {isAnonymous ? t("auth.signInToSave") : t("auth.signIn")}
        </Link>
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
          className="rounded-full ring-2 ring-indigo-300"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-bold">
          {(session.user?.name ?? session.user?.email ?? "?")[0].toUpperCase()}
        </div>
      )}
      <span className="text-sm font-medium hidden sm:inline text-zinc-700 dark:text-zinc-200 max-w-30 truncate">
        {session.user?.name ?? session.user?.email}
      </span>
      <Link
        href="/settings"
        className="text-xs px-2 py-1 rounded border border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
      >
        {t("app.settings.link")}
      </Link>
      <button
        onClick={() => signOut({ callbackUrl: "/sign-in" })}
        className="text-xs px-2 py-1 rounded border border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        aria-label={t("auth.signOut")}
      >
        {t("auth.signOut")}
      </button>
    </div>
  );
}
