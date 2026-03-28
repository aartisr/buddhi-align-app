"use client";
import { DhyanaMeditation } from "@buddhi-align/shared-ui";
import ModuleLayout from "../components/ModuleLayout";
import { useDhyanaMeditationEntries } from "../hooks/useDhyanaMeditationEntries";
import { useState } from "react";
import { useI18n } from "../i18n/provider";

export default function DhyanaMeditationPage() {
  const { t } = useI18n();
  const { entries, loading, addEntry, deleteEntry } = useDhyanaMeditationEntries();
  const [form, setForm] = useState({ date: "", type: "", duration: 0, notes: "" });

  return (
    <ModuleLayout titleKey="module.dhyana.title">
      <form
        className="mb-8 flex flex-col gap-4 p-6 rounded-2xl bg-gradient-to-br from-emerald/20 via-gold/10 to-primary/10 border-2 border-emerald shadow-lg max-w-xl mx-auto"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!form.date || !form.type || !form.duration) return;
          await addEntry(form);
          setForm({ date: "", type: "", duration: 0, notes: "" });
        }}
        aria-label={t("module.dhyana.title")}
      >
        <div className="flex flex-col gap-4 w-full">
          <span className="text-3xl self-center" aria-hidden>🧘‍♀️</span>
          <input
            type="date"
            className="border-2 border-emerald bg-surface rounded-xl px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-gold text-lg shadow-sm text-zinc-900 placeholder-zinc-400"
            value={form.date}
            onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            required
            aria-label={t("form.date")}
          />
          <input
            type="text"
            placeholder={t("form.placeholder.type")}
            className="border-2 border-primary bg-surface rounded-xl px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-emerald text-lg shadow-sm text-zinc-900 placeholder-zinc-400"
            value={form.type}
            onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
            required
            aria-label={t("form.type")}
          />
          <input
            type="number"
            min="1"
            placeholder={t("form.placeholder.duration")}
            className="border-2 border-gold bg-surface rounded-xl px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary text-lg shadow-sm text-zinc-900 placeholder-zinc-400"
            value={form.duration || ""}
            onChange={e => setForm(f => ({ ...f, duration: Number(e.target.value) }))}
            required
            aria-label={t("form.duration")}
          />
          <input
            type="text"
            placeholder={t("form.placeholder.notes")}
            className="border-2 border-accent bg-surface rounded-xl px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-emerald text-lg shadow-sm text-zinc-900 placeholder-zinc-400"
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            aria-label={t("form.notes")}
          />
          <button
            type="submit"
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald to-gold text-emerald font-bold shadow-lg hover:from-gold hover:to-primary focus:outline-none focus:ring-2 focus:ring-gold transition w-full"
            aria-label={t("app.add")}
          >
            <span className="text-xl">➕</span> <span className="font-bold">{t("app.add")}</span>
          </button>
        </div>
      </form>
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
      <ul className="mt-4">
        {entries.map((entry) => (
          <li key={entry.id} className="flex items-center gap-2 text-sm">
            <span>{entry.date} - {entry.type} - {entry.duration} {t("label.durationUnit")} - {entry.notes}</span>
            <button onClick={() => deleteEntry(entry.id!)} className="text-red-600 hover:underline ml-2">{t("app.delete")}</button>
          </li>
        ))}
      </ul>
    </ModuleLayout>
  );
}
