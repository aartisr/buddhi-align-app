"use client";
import { DharmaPlanner } from "@buddhi-align/shared-ui";
import ModuleLayout from "../components/ModuleLayout";
import ModuleEntryForm from "../components/ModuleEntryForm";
import { ModuleFormField } from "../components/ModuleFormFields";
import {
  DHARMA_INITIAL_FORM_STATE,
  getDharmaFields,
  type DharmaFormState,
} from "../config/module-fields";
import { useDharmaPlannerEntries } from "../hooks/useDharmaPlannerEntries";
import { useState } from "react";
import { useI18n } from "../i18n/provider";

export default function DharmaPlannerPage() {
  const { t } = useI18n();
  const { entries, loading, addEntry, deleteEntry, isCreating, deletingIds } = useDharmaPlannerEntries();
  const [form, setForm] = useState<DharmaFormState>(DHARMA_INITIAL_FORM_STATE);
  const fields = getDharmaFields(form, t);

  return (
    <ModuleLayout titleKey="module.dharma.title">
      <ModuleEntryForm
        title={t("module.dharma.title")}
        icon="📜"
        className="app-form-shell app-form-shell--dharma mb-8 flex flex-col gap-4 p-6 rounded-2xl max-w-xl mx-auto"
        onSubmit={async (e) => {
          e.preventDefault();
          if (isCreating) return;
          if (!form.date || !form.goal || !form.action) return;
          await addEntry(form);
          setForm({ ...DHARMA_INITIAL_FORM_STATE });
        }}
        isSubmitting={isCreating}
        submitLabel={t("form.saveEntry")}
        submitPendingLabel={t("form.savingEntry")}
        helperText={t("form.helperRequired")}
        submitButtonClassName="app-button-primary app-button-primary--dharma"
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
        <DharmaPlanner
          title={t("module.dharma.title")}
          description={t("module.dharma.description")}
          emptyState={t("list.empty.dharma")}
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
