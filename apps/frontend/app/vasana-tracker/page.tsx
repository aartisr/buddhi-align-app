"use client";
import { VasanaTracker } from "@buddhi-align/shared-ui";
import ModuleLayout from "../components/ModuleLayout";
import ModuleEntryForm from "../components/ModuleEntryForm";
import EntryDeleteList from "../components/EntryDeleteList";
import { ModuleFormField } from "../components/ModuleFormFields";
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
  const { entries, loading, addEntry, deleteEntry } = useVasanaTrackerEntries();
  const [form, setForm] = useState<VasanaFormState>(VASANA_INITIAL_FORM_STATE);
  const fields = getVasanaFields(form, t);

  return (
    <ModuleLayout titleKey="module.vasana.title">
      <ModuleEntryForm
        title={t("module.vasana.title")}
        icon="🌱"
        className="mb-8 flex flex-col gap-4 p-6 rounded-2xl bg-linear-to-br from-rose/20 via-gold/10 to-primary/10 border-2 border-rose shadow-lg max-w-xl mx-auto"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!form.date || !form.habit || !form.tendency) return;
          await addEntry(form);
          setForm({ ...VASANA_INITIAL_FORM_STATE });
        }}
        submitLabel={t("app.add")}
        submitButtonClassName="px-6 py-2 rounded-xl bg-linear-to-r from-rose to-gold text-rose font-bold shadow-lg hover:from-gold hover:to-emerald focus:outline-none focus:ring-2 focus:ring-gold transition w-full"
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
        />
      )}
      <EntryDeleteList
        entries={entries}
        onDelete={deleteEntry}
        deleteLabel={t("app.delete")}
        renderText={(entry) => `${entry.date} - ${entry.habit} - ${entry.tendency} - ${entry.notes}`}
      />
    </ModuleLayout>
  );
}
