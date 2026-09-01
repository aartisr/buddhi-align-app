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
      <div className="max-w-5xl mx-auto space-y-12 pb-16">
        <FocusIntro
          title="Record one gratitude moment"
          summary="Capture the one devotional reflection that mattered most today."
        />

        <div className="max-w-2xl mx-auto mb-12">
          <div className="bg-(--surface-soft) border border-(--border-subtle) rounded-2xl p-6 shadow-sm">
             <h3 className="text-lg font-bold mb-4 text-(--foreground) text-center">Inspiration</h3>
             <DailyReflectionPrompt module="bhakti" />
          </div>
        </div>

        <ModuleEntryForm
          title={t("module.bhakti.title")}
          icon="🌸"
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
          submitButtonClassName="bg-(--rose) text-(--on-primary) hover:brightness-110"
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
          <div className="flex justify-center p-12"><span className="app-inline-spinner w-8 h-8 text-(--primary)" /></div>
        ) : (
          <div className="max-w-4xl mx-auto">
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
          </div>
        )}
      </div>
    </ModuleLayout>
  );
}
