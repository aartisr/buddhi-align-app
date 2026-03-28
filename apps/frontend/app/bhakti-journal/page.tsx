"use client";
import { BhaktiJournal } from "@buddhi-align/shared-ui";
import ModuleLayout from "../components/ModuleLayout";
import ModuleEntryForm from "../components/ModuleEntryForm";
import EntryDeleteList from "../components/EntryDeleteList";
import { ModuleFormField } from "../components/ModuleFormFields";
import DailyReflectionPrompt from "../components/DailyReflectionPrompt";
import {
  BHAKTI_INITIAL_FORM_STATE,
  getBhaktiFields,
  type BhaktiFormState,
} from "../config/module-fields";
import { useBhaktiJournalEntries } from "../hooks/useBhaktiJournalEntries";
import { useState } from "react";
import { useI18n } from "../i18n/provider";

export default function BhaktiJournalPage() {
  const { t } = useI18n();
  const { entries, loading, addEntry, deleteEntry } = useBhaktiJournalEntries();
  const [form, setForm] = useState<BhaktiFormState>(BHAKTI_INITIAL_FORM_STATE);
  const fields = getBhaktiFields(form, t);

  return (
    <ModuleLayout titleKey="module.bhakti.title">
      <DailyReflectionPrompt module="bhakti" />
      <ModuleEntryForm
        title={t("module.bhakti.title")}
        icon="🌸"
        className="app-form-shell app-form-shell--bhakti mb-8 flex flex-col gap-4 p-6 rounded-2xl max-w-xl mx-auto"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!form.date || !form.reflection || !form.gratitude) return;
          await addEntry(form);
          setForm({ ...BHAKTI_INITIAL_FORM_STATE });
        }}
        submitLabel={t("app.add")}
        submitButtonClassName="app-button-primary app-button-primary--bhakti"
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
        <BhaktiJournal
          title={t("module.bhakti.title")}
          description={t("module.bhakti.description")}
          emptyState={t("list.empty.bhakti")}
          gratitudeLabel={t("label.gratitude")}
          entries={entries}
          onAddEntry={addEntry}
        />
      )}
      <EntryDeleteList
        entries={entries}
        onDelete={deleteEntry}
        deleteLabel={t("app.delete")}
        renderText={(entry) => `${entry.date} - ${entry.reflection} - ${t("label.gratitude")}: ${entry.gratitude}`}
      />
    </ModuleLayout>
  );
}
