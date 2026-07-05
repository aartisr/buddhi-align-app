"use client";
import { BhaktiJournal } from "@buddhi-align/shared-ui";
import ModuleLayout from "../components/ModuleLayout";
import ModuleEntryForm from "../components/ModuleEntryForm";
import { ModuleFormField } from "../components/ModuleFormFields";
import DailyReflectionPrompt from "../components/DailyReflectionPrompt";
import {
  BHAKTI_INITIAL_FORM_STATE,
  getBhaktiFields,
  type BhaktiFormState,
} from "../config/module-fields";
import { useCopilotPracticeDraft } from "../hooks/useCopilotPracticeDraft";
import { useBhaktiJournalEntries } from "../hooks/useBhaktiJournalEntries";
import { useState } from "react";
import { useI18n } from "../i18n/provider";
import FocusIntro from "../components/FocusIntro";
import LazyDetails from "../components/LazyDetails";

export default function BhaktiJournalPage() {
  const { t } = useI18n();
  const { entries, loading, addEntry, deleteEntry, isCreating, deletingIds } = useBhaktiJournalEntries();
  const [form, setForm] = useState<BhaktiFormState>(BHAKTI_INITIAL_FORM_STATE);
  useCopilotPracticeDraft("bhakti", BHAKTI_INITIAL_FORM_STATE, setForm);
  const fields = getBhaktiFields(form, t);

  return (
    <ModuleLayout titleKey="module.bhakti.title">
      <FocusIntro
        title="Record one gratitude moment"
        summary="Capture the one devotional reflection that mattered most today."
      />

      <LazyDetails summary="Need a prompt?" className="app-surface-card max-w-4xl mx-auto mb-5 p-4">
        <DailyReflectionPrompt module="bhakti" />
      </LazyDetails>

      <ModuleEntryForm
        title={t("module.bhakti.title")}
        icon="🌸"
        className="app-form-shell app-form-shell--bhakti mb-8 flex flex-col gap-4 p-6 rounded-2xl max-w-xl mx-auto"
        onSubmit={async (e) => {
          e.preventDefault();
          if (isCreating) return;
          if (!form.date || !form.reflection || !form.gratitude) return;
          await addEntry(form);
          setForm({ ...BHAKTI_INITIAL_FORM_STATE });
        }}
        isSubmitting={isCreating}
        submitLabel={t("form.saveEntry")}
        submitPendingLabel={t("form.savingEntry")}
        helperText={t("form.helperRequired")}
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
          onDelete={deleteEntry}
          deletingIds={deletingIds}
          deleteLabel={t("app.delete")}
        />
      )}
    </ModuleLayout>
  );
}
