"use client";
import { JnanaReflection } from "@buddhi-align/shared-ui";
import ShareInsightCard from "../components/ShareInsightCard";
import ModuleLayout from "../components/ModuleLayout";
import ModuleEntryForm from "../components/ModuleEntryForm";
import { ModuleFormField } from "../components/ModuleFormFields";
import DailyReflectionPrompt from "../components/DailyReflectionPrompt";
import SanskritGlossaryGuide from "../components/SanskritGlossaryGuide";
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

export default function JnanaReflectionPage() {
  const { t } = useI18n();
  const { entries, loading, addEntry, deleteEntry, isCreating, deletingIds } = useJnanaReflectionEntries();
  const [form, setForm] = useState<JnanaFormState>(JNANA_INITIAL_FORM_STATE);

  useCopilotPracticeDraft("jnana", JNANA_INITIAL_FORM_STATE, setForm);
  const fields = getJnanaFields(form, t);

  return (
    <ModuleLayout titleKey="module.jnana.title">
      <div className="max-w-5xl mx-auto space-y-12 pb-16">
        <FocusIntro
          title="Capture one insight"
          summary="Write the clearest insight from today in a few lines."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* 10/10 Enhancement: Sanskrit Wisdom & Vedic Intonation Guide */}
          <div className="flex flex-col">
            <h3 className="text-lg font-bold mb-4 text-(--foreground)">Sanskrit Glossary</h3>
            <SanskritGlossaryGuide />
          </div>

          <div className="flex flex-col">
            <h3 className="text-lg font-bold mb-4 text-(--foreground)">Contemplation Prompt</h3>
            <div className="flex-1 rounded-2xl bg-(--surface-soft) border border-(--border-subtle) overflow-hidden shadow-sm">
               <DailyReflectionPrompt module="jnana" />
            </div>
          </div>
        </div>

        <ModuleEntryForm
          title={t("module.jnana.title")}
          icon="🧘‍♂️"
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
          </div>
        )}

        {entries.length > 0 && !loading && (
          <div className="max-w-3xl mx-auto mt-16 pt-12 border-t border-(--border-subtle)">
            <h2 className="text-2xl font-bold mb-6 text-center text-(--foreground)">Share Your Insight</h2>
            <ShareInsightCard insightText={entries[0].insight} author="My Sadhana" theme="dark" />
          </div>
        )}
      </div>
    </ModuleLayout>
  );
}
