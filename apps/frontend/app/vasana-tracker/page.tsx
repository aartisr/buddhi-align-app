"use client";
import { VasanaTracker } from "@buddhi-align/shared-ui";
import ModuleLayout from "../components/ModuleLayout";
import ModuleEntryForm from "../components/ModuleEntryForm";
import { ModuleFormField } from "../components/ModuleFormFields";
import {
  getVasanaFields,
  VASANA_INITIAL_FORM_STATE,
  type VasanaFormState,
} from "../config/module-fields";
import { useCopilotPracticeDraft } from "../hooks/useCopilotPracticeDraft";
import { useVasanaTrackerEntries } from "../hooks/useVasanaTrackerEntries";
import { useState } from "react";
import { useI18n } from "../i18n/provider";
import FocusIntro from "../components/FocusIntro";

export default function VasanaTrackerPage() {
  const { t } = useI18n();
  const { entries, loading, addEntry, deleteEntry, isCreating, deletingIds } = useVasanaTrackerEntries();
  const [form, setForm] = useState<VasanaFormState>(VASANA_INITIAL_FORM_STATE);

  useCopilotPracticeDraft("vasana", VASANA_INITIAL_FORM_STATE, setForm);
  const fields = getVasanaFields(form, t);

  return (
    <ModuleLayout titleKey="module.vasana.title">
      <div className="max-w-5xl mx-auto space-y-12 pb-16">
        <FocusIntro
          title="Track one pattern"
          summary="Log one reactive habit or emotional trigger when it happens."
        />

        <ModuleEntryForm
          title={t("module.vasana.title")}
          icon="🌪️"
          onSubmit={async (e) => {
            e.preventDefault();
            if (isCreating) return;
            if (!form.date || !form.trigger || !form.reaction) return;
            await addEntry(form);
            setForm({ ...VASANA_INITIAL_FORM_STATE });
          }}
          isSubmitting={isCreating}
          submitLabel={t("form.saveEntry")}
          submitPendingLabel={t("form.savingEntry")}
          helperText={t("form.helperRequired")}
          submitButtonClassName="bg-(--accent) text-(--on-primary) hover:brightness-110"
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
            <VasanaTracker
              title={t("module.vasana.title")}
              description={t("module.vasana.description")}
              emptyState={t("list.empty.vasana")}
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
