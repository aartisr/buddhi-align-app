"use client";
import { DhyanaMeditation } from "@buddhi-align/shared-ui";
import ModuleLayout from "../components/ModuleLayout";
import ModuleEntryForm from "../components/ModuleEntryForm";
import EntryDeleteList from "../components/EntryDeleteList";
import { ModuleFormField } from "../components/ModuleFormFields";
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
  const { entries, loading, addEntry, deleteEntry } = useDhyanaMeditationEntries();
  const [form, setForm] = useState<DhyanaFormState>(DHYANA_INITIAL_FORM_STATE);
  const fields = getDhyanaFields(form, t);

  return (
    <ModuleLayout titleKey="module.dhyana.title">
      <ModuleEntryForm
        title={t("module.dhyana.title")}
        icon="🧘‍♀️"
        className="mb-8 flex flex-col gap-4 p-6 rounded-2xl bg-linear-to-br from-emerald/20 via-gold/10 to-primary/10 border-2 border-emerald shadow-lg max-w-xl mx-auto"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!form.date || !form.type || !form.duration) return;
          await addEntry(form);
          setForm({ ...DHYANA_INITIAL_FORM_STATE });
        }}
        submitLabel={t("app.add")}
        submitButtonClassName="px-6 py-2 rounded-xl bg-linear-to-r from-emerald to-gold text-emerald font-bold shadow-lg hover:from-gold hover:to-primary focus:outline-none focus:ring-2 focus:ring-gold transition w-full"
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
        />
      )}
      <EntryDeleteList
        entries={entries}
        onDelete={deleteEntry}
        deleteLabel={t("app.delete")}
        renderText={(entry) => `${entry.date} - ${entry.type} - ${entry.duration} ${t("label.durationUnit")} - ${entry.notes}`}
      />
    </ModuleLayout>
  );
}
