"use client";
import { DhyanaMeditation } from "@buddhi-align/shared-ui";
import ModuleLayout from "../components/ModuleLayout";
import ModuleEntryForm from "../components/ModuleEntryForm";
import { ModuleFormField } from "../components/ModuleFormFields";
import PranayamaTimer from "../components/PranayamaTimer";
import {
  DHYANA_INITIAL_FORM_STATE,
  getDhyanaFields,
  type DhyanaFormState,
} from "../config/module-fields";
import { useDhyanaMeditationEntries } from "../hooks/useDhyanaMeditationEntries";
import { useState } from "react";
import { useI18n } from "../i18n/provider";

export default function DhyanaMeditationPage() {
  const { t } = useI18n();
  const { entries, loading, addEntry, deleteEntry, isCreating, deletingIds } = useDhyanaMeditationEntries();
  const [form, setForm] = useState<DhyanaFormState>(DHYANA_INITIAL_FORM_STATE);
  const fields = getDhyanaFields(form, t);

  return (
    <ModuleLayout titleKey="module.dhyana.title">
      <PranayamaTimer />
      <ModuleEntryForm
        title={t("module.dhyana.title")}
        icon="🧘‍♀️"
        className="app-form-shell app-form-shell--dhyana mb-8 flex flex-col gap-4 p-6 rounded-2xl max-w-xl mx-auto"
        onSubmit={async (e) => {
          e.preventDefault();
          if (isCreating) return;
          if (!form.date || !form.type || !form.duration) return;
          await addEntry(form);
          setForm({ ...DHYANA_INITIAL_FORM_STATE });
        }}
        isSubmitting={isCreating}
        submitLabel={t("app.add")}
        submitButtonClassName="app-button-primary app-button-primary--dhyana"
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
        <DhyanaMeditation
          title={t("module.dhyana.title")}
          description={t("module.dhyana.description")}
          emptyState={t("list.empty.dhyana")}
          durationUnit={t("label.durationUnit")}
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
