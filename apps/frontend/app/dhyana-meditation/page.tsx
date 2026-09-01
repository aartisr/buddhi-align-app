"use client";
import { DhyanaMeditation } from "@buddhi-align/shared-ui";
import ModuleLayout from "../components/ModuleLayout";
import ModuleEntryForm from "../components/ModuleEntryForm";
import { ModuleFormField } from "../components/ModuleFormFields";
import PranayamaTimer from "../components/PranayamaTimer";
import TanpuraSadhanaDrone from "../components/TanpuraSadhanaDrone";
import {
  DHYANA_INITIAL_FORM_STATE,
  getDhyanaFields,
  type DhyanaFormState,
} from "../config/module-fields";
import { useCopilotPracticeDraft } from "../hooks/useCopilotPracticeDraft";
import { useDhyanaMeditationEntries } from "../hooks/useDhyanaMeditationEntries";
import { useState } from "react";
import { useI18n } from "../i18n/provider";
import FocusIntro from "../components/FocusIntro";

export default function DhyanaMeditationPage() {
  const { t } = useI18n();
  const { entries, loading, addEntry, deleteEntry, isCreating, deletingIds } = useDhyanaMeditationEntries();
  const [form, setForm] = useState<DhyanaFormState>(DHYANA_INITIAL_FORM_STATE);

  useCopilotPracticeDraft("dhyana", DHYANA_INITIAL_FORM_STATE, setForm);
  const fields = getDhyanaFields(form, t);

  return (
    <ModuleLayout titleKey="module.dhyana.title">
      <div className="max-w-5xl mx-auto space-y-12 pb-16">
        <FocusIntro
          title="Sit once, log once"
          summary="Track one meditation session and keep your rhythm steady."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* 10/10 Enhancement: Acoustic Tanpura Drone & Interval Bells Synthesizer */}
          <div className="flex flex-col">
             <h3 className="text-lg font-bold mb-4 text-(--foreground)">Sadhana Audio</h3>
             <TanpuraSadhanaDrone />
          </div>

          <div className="flex flex-col">
            <h3 className="text-lg font-bold mb-4 text-(--foreground)">Pranayama Timer</h3>
            <PranayamaTimer />
          </div>
        </div>

        <ModuleEntryForm
          title={t("module.dhyana.title")}
          icon="🧘‍♀️"
          onSubmit={async (e) => {
            e.preventDefault();
            if (isCreating) return;
            if (!form.date || !form.type || !form.duration) return;
            await addEntry(form);
            setForm({ ...DHYANA_INITIAL_FORM_STATE });
          }}
          isSubmitting={isCreating}
          submitLabel={t("form.saveEntry")}
          submitPendingLabel={t("form.savingEntry")}
          helperText={t("form.helperRequired")}
          submitButtonClassName="bg-(--emerald) text-(--on-emerald) hover:brightness-110"
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
            <DhyanaMeditation
              title={t("module.dhyana.title")}
              description={t("module.dhyana.description")}
              emptyState={t("list.empty.dhyana")}
              durationUnit={t("label.durationUnit")}
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
