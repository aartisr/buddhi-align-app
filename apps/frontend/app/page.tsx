"use client";

import React from "react";
import { BuddhiDashboard } from "@buddhi-align/shared-ui";
import ModuleLayout from "./components/ModuleLayout";
import { useI18n, useLocalizedModules } from "./i18n/provider";

export default function Home() {
  const { t } = useI18n();
  const modules = useLocalizedModules();

  return (
    <ModuleLayout titleKey="app.dashboard">
      <BuddhiDashboard
        userName={t("dashboard.defaultUser")}
        heading={t("app.dashboard")}
        subtitle={t("dashboard.subtitle")}
        welcomeTemplate={t("dashboard.welcome")}
        modules={modules}
      />
    </ModuleLayout>
  );
}
