"use client";
import { JnanaReflection } from "@buddhi-align/shared-ui";
import ModuleLayout from "../components/ModuleLayout";
import ModuleEntryForm from "../components/ModuleEntryForm";
import { ModuleFormField } from "../components/ModuleFormFields";
import DailyReflectionPrompt from "../components/DailyReflectionPrompt";
import {
  getJnanaFields,
  JNANA_INITIAL_FORM_STATE,
  type JnanaFormState,
} from "../config/module-fields";
import { useCopilotPracticeDraft } from "../hooks/useCopilotPracticeDraft";
import { useJnanaReflectionEntries } from "../hooks/useJnanaReflectionEntries";
import { useState } from "react";
import { useI18n } from "../i18n/provider";
import FocusIntro from "../components/FocusIntro";
import LazyDetails from "../components/LazyDetails";

export default function JnanaReflectionPage() {
  const { t } = useI18n();
  const { entries, loading, addEntry, deleteEntry, isCreating, deletingIds } = useJnanaReflectionEntries();
  const [form, setForm] = useState<JnanaFormState>(JNANA_INITIAL_FORM_STATE);
  useCopilotPracticeDraft("jnana", JNANA_INITIAL_FORM_STATE, setForm);
  const fields = getJnanaFields(form, t);

  return (
    <ModuleLayout titleKey="module.jnana.title">
      <FocusIntro
        title="Capture one insight"
        summary="Write the clearest insight from today in a few lines."
      />

      <LazyDetails summary="Need a prompt?" className="app-surface-card max-w-4xl mx-auto mb-5 p-4">
        <DailyReflectionPrompt module="jnana" />
      </LazyDetails>

      <ModuleEntryForm
        title={t("module.jnana.title")}
        icon="🧘‍♂️"
        className="app-form-shell app-form-shell--jnana mb-8 flex flex-col gap-4 p-6 rounded-2xl max-w-xl mx-auto"
        onSubmit={async (e) => {
          e.preventDefault();
          if (isCreating) return;
          if (!form.date || !form.insight || !form.contemplation) return;
          await addEntry(form);
          setForm({ ...JNANA_INITIAL_FORM_STATE });
        }}
        isSubmitting={isCreating}
        submitLabel={t("form.saveEntry")}
        submitPendingLabel={t("form.savingEntry")}
        helperText={t("form.helperRequired")}
        submitButtonClassName="app-button-primary app-button-primary--jnana"
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
        <JnanaReflection
          title={t("module.jnana.title")}
          description={t("module.jnana.description")}
          emptyState={t("list.empty.jnana")}
          contemplationLabel={t("label.contemplation")}
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
