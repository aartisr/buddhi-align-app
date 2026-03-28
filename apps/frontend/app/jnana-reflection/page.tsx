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
import { useJnanaReflectionEntries } from "../hooks/useJnanaReflectionEntries";
import { useState } from "react";
import { useI18n } from "../i18n/provider";

export default function JnanaReflectionPage() {
  const { t } = useI18n();
  const { entries, loading, addEntry, deleteEntry, isCreating, deletingIds } = useJnanaReflectionEntries();
  const [form, setForm] = useState<JnanaFormState>(JNANA_INITIAL_FORM_STATE);
  const fields = getJnanaFields(form, t);

  return (
    <ModuleLayout titleKey="module.jnana.title">
      <DailyReflectionPrompt module="jnana" />
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
        submitLabel={t("app.add")}
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
