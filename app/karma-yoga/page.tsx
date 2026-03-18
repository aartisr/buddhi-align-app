"use client";
import { KarmaYogaTracker } from "@buddhi-align/shared-ui";
import ModuleLayout from "../components/ModuleLayout";
import { useKarmaYogaEntries } from "../hooks/useKarmaYogaEntries";
import { useState } from "react";

export default function KarmaYogaPage() {
  const { entries, loading, addEntry, deleteEntry } = useKarmaYogaEntries();
  const [form, setForm] = useState({ date: "", action: "", impact: "" });

  return (
    <ModuleLayout title="Karma Yoga Tracker">
      <form
        className="mb-8 flex flex-col gap-4 p-6 rounded-2xl bg-gradient-to-br from-gold/30 via-emerald/10 to-rose/10 border-2 border-primary shadow-lg max-w-xl mx-auto"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!form.date || !form.action || !form.impact) return;
          await addEntry(form);
          setForm({ date: "", action: "", impact: "" });
        }}
        aria-label="Add Karma Yoga Entry"
      >
        <div className="flex flex-col gap-4 w-full">
          <span className="text-3xl self-center" aria-hidden>🙏</span>
          <input
            type="date"
            className="border-2 border-emerald bg-surface rounded-xl px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-gold text-lg shadow-sm text-zinc-900 placeholder-zinc-400"
            value={form.date}
            onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            required
            aria-label="Date"
          />
          <input
            type="text"
            placeholder="Action (e.g. Serve, Donate)"
            className="border-2 border-primary bg-surface rounded-xl px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-rose text-lg shadow-sm text-zinc-900 placeholder-zinc-400"
            value={form.action}
            onChange={e => setForm(f => ({ ...f, action: e.target.value }))}
            required
            aria-label="Action"
          />
          <input
            type="text"
            placeholder="Impact (e.g. Helped 20 people)"
            className="border-2 border-accent bg-surface rounded-xl px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-emerald text-lg shadow-sm text-zinc-900 placeholder-zinc-400"
            value={form.impact}
            onChange={e => setForm(f => ({ ...f, impact: e.target.value }))}
            required
            aria-label="Impact"
          />
          <button
            type="submit"
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-primary to-accent text-primary font-bold shadow-lg hover:from-gold hover:to-rose focus:outline-none focus:ring-2 focus:ring-gold transition w-full"
            aria-label="Add Entry"
          >
            <span className="text-xl">➕</span> <span className="font-bold">Add</span>
          </button>
        </div>
      </form>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <KarmaYogaTracker
          entries={entries}
          onAddEntry={addEntry}
        />
      )}
      <ul className="mt-4">
        {entries.map((entry) => (
          <li key={entry.id} className="flex items-center gap-2 text-sm">
            <span>{entry.date} - {entry.action} - {entry.impact}</span>
            <button onClick={() => deleteEntry(entry.id!)} className="text-red-600 hover:underline ml-2">Delete</button>
          </li>
        ))}
      </ul>
    </ModuleLayout>
  );
}
