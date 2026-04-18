"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { AutographExchangeFeature } from "@autograph-exchange/feature";
import ModuleLayout from "@/app/components/ModuleLayout";
import { useI18n } from "@/app/i18n/provider";

export default function AutographExchangePage() {
  const { t } = useI18n();
  const { data: session, status } = useSession();

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
      signInHref="/sign-in"
      renderShell={(content) => <ModuleLayout titleKey="module.autograph.title">{content}</ModuleLayout>}
    />
  );
}
