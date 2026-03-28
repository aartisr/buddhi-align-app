"use client";
import { JnanaReflection } from "@buddhi-align/shared-ui";
import ModuleLayout from "../components/ModuleLayout";
import ModuleEntryForm from "../components/ModuleEntryForm";
import EntryDeleteList from "../components/EntryDeleteList";
import { ModuleFormField } from "../components/ModuleFormFields";
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
  const { entries, loading, addEntry, deleteEntry } = useJnanaReflectionEntries();
  const [form, setForm] = useState<JnanaFormState>(JNANA_INITIAL_FORM_STATE);
  const fields = getJnanaFields(form, t);

  return (
    <ModuleLayout titleKey="module.jnana.title">
      <ModuleEntryForm
        title={t("module.jnana.title")}
        icon="🧘‍♂️"
        className="mb-8 flex flex-col gap-4 p-6 rounded-2xl bg-linear-to-br from-emerald/20 via-gold/10 to-primary/10 border-2 border-primary shadow-lg max-w-xl mx-auto"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!form.date || !form.insight || !form.contemplation) return;
          await addEntry(form);
          setForm({ ...JNANA_INITIAL_FORM_STATE });
        }}
        submitLabel={t("app.add")}
        submitButtonClassName="px-6 py-2 rounded-xl bg-linear-to-r from-primary to-emerald text-primary font-bold shadow-lg hover:from-gold hover:to-emerald focus:outline-none focus:ring-2 focus:ring-gold transition w-full"
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
        />
      )}
      <EntryDeleteList
        entries={entries}
        onDelete={deleteEntry}
        deleteLabel={t("app.delete")}
        renderText={(entry) => `${entry.date} - ${entry.insight} - ${t("label.contemplation")}: ${entry.contemplation}`}
      />
    </ModuleLayout>
  );
}
