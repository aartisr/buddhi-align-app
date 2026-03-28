"use client";
import { KarmaYogaTracker } from "@buddhi-align/shared-ui";
import ModuleLayout from "../components/ModuleLayout";
import ModuleEntryForm from "../components/ModuleEntryForm";
import EntryDeleteList from "../components/EntryDeleteList";
import { ModuleFormField } from "../components/ModuleFormFields";
import {
  getKarmaFields,
  KARMA_INITIAL_FORM_STATE,
  type KarmaFormState,
} from "../config/module-fields";
import { useKarmaYogaEntries } from "../hooks/useKarmaYogaEntries";
import { useState } from "react";
import { useI18n } from "../i18n/provider";

export default function KarmaYogaPage() {
  const { t } = useI18n();
  const { entries, loading, addEntry, deleteEntry } = useKarmaYogaEntries();
  const [form, setForm] = useState<KarmaFormState>(KARMA_INITIAL_FORM_STATE);
  const fields = getKarmaFields(form, t);

  return (
    <ModuleLayout titleKey="module.karma.title">
      <ModuleEntryForm
        title={t("module.karma.title")}
        icon="🙏"
        className="mb-8 flex flex-col gap-4 p-6 rounded-2xl bg-linear-to-br from-gold/30 via-emerald/10 to-rose/10 border-2 border-primary shadow-lg max-w-xl mx-auto"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!form.date || !form.action || !form.impact) return;
          await addEntry(form);
          setForm({ ...KARMA_INITIAL_FORM_STATE });
        }}
        submitLabel={t("app.add")}
        submitButtonClassName="px-6 py-2 rounded-xl bg-linear-to-r from-primary to-accent text-primary font-bold shadow-lg hover:from-gold hover:to-rose focus:outline-none focus:ring-2 focus:ring-gold transition w-full"
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
        <KarmaYogaTracker
          title={t("module.karma.title")}
          description={t("module.karma.description")}
          emptyState={t("list.empty.karma")}
          entries={entries}
          onAddEntry={addEntry}
        />
      )}
      <EntryDeleteList
        entries={entries}
        onDelete={deleteEntry}
        deleteLabel={t("app.delete")}
        renderText={(entry) => `${entry.date} - ${entry.action} - ${entry.impact}`}
      />
    </ModuleLayout>
  );
}
