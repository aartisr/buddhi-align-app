"use client";
import { KarmaYogaTracker } from "@buddhi-align/shared-ui";
import ModuleLayout from "../components/ModuleLayout";
import ModuleEntryForm from "../components/ModuleEntryForm";
import { ModuleFormField } from "../components/ModuleFormFields";
import {
  getKarmaFields,
  KARMA_INITIAL_FORM_STATE,
  type KarmaFormState,
} from "../config/module-fields";
import { useCopilotPracticeDraft } from "../hooks/useCopilotPracticeDraft";
import { useKarmaYogaEntries } from "../hooks/useKarmaYogaEntries";
import { useState } from "react";
import { useI18n } from "../i18n/provider";
import FocusIntro from "../components/FocusIntro";

export default function KarmaYogaPage() {
  const { t } = useI18n();
  const { entries, loading, addEntry, deleteEntry, isCreating, deletingIds } = useKarmaYogaEntries();
  const [form, setForm] = useState<KarmaFormState>(KARMA_INITIAL_FORM_STATE);

  useCopilotPracticeDraft("karma", KARMA_INITIAL_FORM_STATE, setForm);
  const fields = getKarmaFields(form, t);

  return (
    <ModuleLayout titleKey="module.karma.title">
      <div className="max-w-5xl mx-auto space-y-12 pb-16">
        <FocusIntro
          title="Log one meaningful act"
          summary="Record one service action and its impact without overthinking it."
        />

        <ModuleEntryForm
          title={t("module.karma.title")}
          icon="🙏"
          onSubmit={async (e) => {
            e.preventDefault();
            if (isCreating) return;
            if (!form.date || !form.action || !form.impact) return;
            await addEntry(form);
            setForm({ ...KARMA_INITIAL_FORM_STATE });
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
            <KarmaYogaTracker
              title={t("module.karma.title")}
              description={t("module.karma.description")}
              emptyState={t("list.empty.karma")}
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
