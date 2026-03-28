"use client";

import PreferencesMenu from "../components/PreferencesMenu";
import { useI18n } from "../i18n/provider";

export default function SettingsPanel() {
  const { t } = useI18n();

  return (
    <section className="app-surface-card max-w-2xl mx-auto p-4 sm:p-6">
      <h3 className="app-panel-title text-xl sm:text-2xl font-bold mb-2">{t("app.settings.title")}</h3>
      <p className="app-copy-soft mb-6">{t("app.settings.subtitle")}</p>
      <PreferencesMenu showTrigger={false} />
    </section>
  );
}
