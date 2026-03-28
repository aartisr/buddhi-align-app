"use client";
import { KarmaYogaTracker } from "@buddhi-align/shared-ui";
import ModuleLayout from "../components/ModuleLayout";
import ModuleEntryForm from "../components/ModuleEntryForm";
import { ModuleFormField } from "../components/ModuleFormFields";
import {
  getKarmaFields,
  KARMA_INITIAL_FORM_STATE,
  type KarmaFormState,
} from "../config/module-fields";
import { useKarmaYogaEntries } from "../hooks/useKarmaYogaEntries";
import { useState } from "react";
import { useI18n } from "../i18n/provider";

export default function KarmaYogaPage() {
  const { t } = useI18n();
  const { entries, loading, addEntry, deleteEntry, isCreating, deletingIds } = useKarmaYogaEntries();
  const [form, setForm] = useState<KarmaFormState>(KARMA_INITIAL_FORM_STATE);
  const fields = getKarmaFields(form, t);

  return (
    <ModuleLayout titleKey="module.karma.title">
      <ModuleEntryForm
        title={t("module.karma.title")}
        icon="🙏"
        className="app-form-shell app-form-shell--karma mb-8 flex flex-col gap-4 p-6 rounded-2xl max-w-xl mx-auto"
        onSubmit={async (e) => {
          e.preventDefault();
          if (isCreating) return;
          if (!form.date || !form.action || !form.impact) return;
          await addEntry(form);
          setForm({ ...KARMA_INITIAL_FORM_STATE });
        }}
        isSubmitting={isCreating}
        submitLabel={t("app.add")}
        submitButtonClassName="app-button-primary app-button-primary--karma"
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
        <KarmaYogaTracker
          title={t("module.karma.title")}
          description={t("module.karma.description")}
          emptyState={t("list.empty.karma")}
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
