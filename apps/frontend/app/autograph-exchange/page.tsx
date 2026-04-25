"use client";

import React from "react";
import { useSession } from "next-auth/react";
import type { AutographProfile } from "@aartisr/autograph-contract";
import { AutographExchangeFeature } from "@aartisr/autograph-feature";
import { useCurrentSignInHref } from "@/app/auth/use-current-sign-in-href";
import ModuleLayout from "@/app/components/ModuleLayout";
import { useI18n } from "@/app/i18n/provider";

function profileHrefForSigner(profile: AutographProfile): string {
  return `/profiles/${encodeURIComponent(profile.id)}`;
}

export default function AutographExchangePage() {
  const { t } = useI18n();
  const { data: session, status } = useSession();
  const signInHref = useCurrentSignInHref("/autograph-exchange");

  return (
    <AutographExchangeFeature
      authStatus={status === "loading" ? "loading" : session?.user?.id ? "authenticated" : "unauthenticated"}
      viewer={
        session?.user?.id
          ? {
              id: session.user.id,
              name: session.user.name,
              email: session.user.email,
            }
          : null
      }
      roleLabels={{
        student: t("autograph.profile.role.student"),
        teacher: t("autograph.profile.role.teacher"),
      }}
      loadingMessage={t("user.loadingSession")}
      signedOutMessage={t("auth.persistHint")}
      signInLabel={t("auth.signInToSave")}
      signInHref={signInHref}
      profileHrefForSigner={profileHrefForSigner}
      renderShell={(content) => <ModuleLayout titleKey="module.autograph.title">{content}</ModuleLayout>}
    />
  );
}
