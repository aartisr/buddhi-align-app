"use client";
import { BhaktiJournal } from "@buddhi-align/shared-ui";
import ModuleLayout from "../components/ModuleLayout";
import { useBhaktiJournalEntries } from "../hooks/useBhaktiJournalEntries";
import { useState } from "react";
import { useI18n } from "../i18n/provider";

export default function BhaktiJournalPage() {
  const { t } = useI18n();
  const { entries, loading, addEntry, deleteEntry } = useBhaktiJournalEntries();
  const [form, setForm] = useState({ date: "", reflection: "", gratitude: "" });

  return (
    <ModuleLayout titleKey="module.bhakti.title">
      <form
        className="mb-8 flex flex-col gap-4 p-6 rounded-2xl bg-gradient-to-br from-rose/20 via-gold/10 to-emerald/10 border-2 border-rose shadow-lg max-w-xl mx-auto"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!form.date || !form.reflection || !form.gratitude) return;
          await addEntry(form);
          setForm({ date: "", reflection: "", gratitude: "" });
        }}
        aria-label={t("module.bhakti.title")}
      >
        <div className="flex flex-col gap-4 w-full">
          <span className="text-3xl self-center" aria-hidden>🌸</span>
          <input
            type="date"
            className="border-2 border-rose bg-surface rounded-xl px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-gold text-lg shadow-sm text-zinc-900 placeholder-zinc-400"
            value={form.date}
            onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            required
            aria-label={t("form.date")}
          />
          <input
            type="text"
            placeholder={t("form.placeholder.reflection")}
            className="border-2 border-primary bg-surface rounded-xl px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-rose text-lg shadow-sm text-zinc-900 placeholder-zinc-400"
            value={form.reflection}
            onChange={e => setForm(f => ({ ...f, reflection: e.target.value }))}
            required
            aria-label={t("form.reflection")}
          />
          <input
            type="text"
            placeholder={t("form.placeholder.gratitude")}
            className="border-2 border-accent bg-surface rounded-xl px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-emerald text-lg shadow-sm text-zinc-900 placeholder-zinc-400"
            value={form.gratitude}
            onChange={e => setForm(f => ({ ...f, gratitude: e.target.value }))}
            required
            aria-label={t("form.gratitude")}
          />
          <button
            type="submit"
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-rose to-gold text-rose font-bold shadow-lg hover:from-gold hover:to-emerald focus:outline-none focus:ring-2 focus:ring-gold transition w-full"
            aria-label={t("app.add")}
          >
            <span className="text-xl">➕</span> <span className="font-bold">{t("app.add")}</span>
          </button>
        </div>
      </form>
      {loading ? (
        <div>{t("app.loading")}</div>
      ) : (
        <BhaktiJournal
          title={t("module.bhakti.title")}
          description={t("module.bhakti.description")}
          emptyState={t("list.empty.bhakti")}
          gratitudeLabel={t("label.gratitude")}
          entries={entries}
          onAddEntry={addEntry}
        />
      )}
      <ul className="mt-4">
        {entries.map((entry) => (
          <li key={entry.id} className="flex items-center gap-2 text-sm">
            <span>{entry.date} - {entry.reflection} - {t("label.gratitude")}: {entry.gratitude}</span>
            <button onClick={() => deleteEntry(entry.id!)} className="text-red-600 hover:underline ml-2">{t("app.delete")}</button>
          </li>
        ))}
      </ul>
    </ModuleLayout>
  );
}
