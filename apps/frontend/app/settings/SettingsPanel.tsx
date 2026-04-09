"use client";

import PreferencesMenu from "../components/PreferencesMenu";
import { useI18n } from "../i18n/provider";
import Link from "next/link";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";

const DataPortability = dynamic(() => import("../components/DataPortability"), {
  loading: () => <p className="app-copy-soft text-sm mt-6">Loading data tools...</p>,
});

export default function SettingsPanel() {
  const { t } = useI18n();
  const { data: session } = useSession();

  return (
    <section className="app-surface-card max-w-2xl mx-auto p-4 sm:p-6">
      <h3 className="app-panel-title text-xl sm:text-2xl font-bold mb-2">{t("app.settings.title")}</h3>
      <p className="app-copy-soft mb-6">{t("app.settings.subtitle")}</p>
      <PreferencesMenu showTrigger={false} />
      <DataPortability />
      {session ? (
        <div className="mt-6 border-t pt-5">
          <h4 className="app-panel-title text-base font-semibold mb-1">{t("admin.settings.title")}</h4>
          <p className="app-copy-soft text-sm mb-3">{t("admin.settings.subtitle")}</p>
          <Link href="/admin-access" className="app-user-action inline-flex px-3 py-2 rounded-lg text-sm">
            {t("admin.settings.open")}
          </Link>
        </div>
      ) : null}
    </section>
  );
}
