"use client";
import { VasanaTracker } from "@buddhi-align/shared-ui";
import ModuleLayout from "../components/ModuleLayout";
import ModuleEntryForm from "../components/ModuleEntryForm";
import { ModuleFormField } from "../components/ModuleFormFields";
import DailyReflectionPrompt from "../components/DailyReflectionPrompt";
import {
  getVasanaFields,
  type VasanaFormState,
  VASANA_INITIAL_FORM_STATE,
} from "../config/module-fields";
import { useVasanaTrackerEntries } from "../hooks/useVasanaTrackerEntries";
import { useState } from "react";
import { useI18n } from "../i18n/provider";

export default function VasanaTrackerPage() {
  const { t } = useI18n();
  const { entries, loading, addEntry, deleteEntry, isCreating, deletingIds } = useVasanaTrackerEntries();
  const [form, setForm] = useState<VasanaFormState>(VASANA_INITIAL_FORM_STATE);
  const fields = getVasanaFields(form, t);

  return (
    <ModuleLayout titleKey="module.vasana.title">
      <DailyReflectionPrompt module="vasana" />
      <ModuleEntryForm
        title={t("module.vasana.title")}
        icon="🌱"
        className="app-form-shell app-form-shell--vasana mb-8 flex flex-col gap-4 p-6 rounded-2xl max-w-xl mx-auto"
        onSubmit={async (e) => {
          e.preventDefault();
          if (isCreating) return;
          if (!form.date || !form.habit || !form.tendency) return;
          await addEntry(form);
          setForm({ ...VASANA_INITIAL_FORM_STATE });
        }}
        isSubmitting={isCreating}
        submitLabel={t("app.add")}
        submitButtonClassName="app-button-primary app-button-primary--vasana"
      >
        {fields.map((field) => (
          <ModuleFormField
            key={field.key}
            field={field}
            onValueChange={(key, value) => setForm((f) => ({ ...f, [key]: value } as typeof f))}
          />
        ))}
      </ModuleEntryForm>
      {loading ? (
        <div>{t("app.loading")}</div>
      ) : (
        <VasanaTracker
          title={t("module.vasana.title")}
          description={t("module.vasana.description")}
          emptyState={t("list.empty.vasana")}
          entries={entries}
          onAddEntry={addEntry}
          onDelete={deleteEntry}
          deletingIds={deletingIds}
          deleteLabel={t("app.delete")}
        />
      )}
    </ModuleLayout>
  );
}
