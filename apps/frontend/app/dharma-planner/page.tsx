"use client";
import { DharmaPlanner } from "@buddhi-align/shared-ui";
import ModuleLayout from "../components/ModuleLayout";
import ModuleEntryForm from "../components/ModuleEntryForm";
import { ModuleFormField } from "../components/ModuleFormFields";
import {
  DHARMA_INITIAL_FORM_STATE,
  getDharmaFields,
  type DharmaFormState,
} from "../config/module-fields";
import { useCopilotPracticeDraft } from "../hooks/useCopilotPracticeDraft";
import { useDharmaPlannerEntries } from "../hooks/useDharmaPlannerEntries";
import { useState } from "react";
import { useI18n } from "../i18n/provider";
import FocusIntro from "../components/FocusIntro";

export default function DharmaPlannerPage() {
  const { t } = useI18n();
  const { entries, loading, addEntry, deleteEntry, isCreating, deletingIds } = useDharmaPlannerEntries();
  const [form, setForm] = useState<DharmaFormState>(DHARMA_INITIAL_FORM_STATE);

  useCopilotPracticeDraft("dharma", DHARMA_INITIAL_FORM_STATE, setForm);
  const fields = getDharmaFields(form, t);

  return (
    <ModuleLayout titleKey="module.dharma.title">
      <div className="max-w-5xl mx-auto space-y-12 pb-16">
        <FocusIntro
          title="Pick one clear intention"
          summary="Capture one purpose-aligned goal and the next concrete action."
        />

        <ModuleEntryForm
          title={t("module.dharma.title")}
          icon="📜"
          onSubmit={async (e) => {
            e.preventDefault();
            if (isCreating) return;
            if (!form.date || !form.goal || !form.action) return;
            await addEntry(form);
            setForm({ ...DHARMA_INITIAL_FORM_STATE });
          }}
          isSubmitting={isCreating}
          submitLabel={t("form.saveEntry")}
          submitPendingLabel={t("form.savingEntry")}
          helperText={t("form.helperRequired")}
          submitButtonClassName="bg-(--gold) text-(--foreground) hover:brightness-110"
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
            <DharmaPlanner
              title={t("module.dharma.title")}
              description={t("module.dharma.description")}
              emptyState={t("list.empty.dharma")}
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
