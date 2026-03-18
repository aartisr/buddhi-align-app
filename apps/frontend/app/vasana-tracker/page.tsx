"use client";
import { VasanaTracker } from "@buddhi-align/shared-ui";
import ModuleLayout from "../components/ModuleLayout";
import { useVasanaTrackerEntries } from "../hooks/useVasanaTrackerEntries";
import { useState } from "react";

export default function VasanaTrackerPage() {
  const { entries, loading, addEntry, deleteEntry } = useVasanaTrackerEntries();
  const [form, setForm] = useState({ date: "", habit: "", tendency: "", notes: "" });

  return (
    <ModuleLayout title="Vasana Tracker">
      <form
        className="mb-8 flex flex-col gap-4 p-6 rounded-2xl bg-gradient-to-br from-rose/20 via-gold/10 to-primary/10 border-2 border-rose shadow-lg max-w-xl mx-auto"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!form.date || !form.habit || !form.tendency) return;
          await addEntry(form);
          setForm({ date: "", habit: "", tendency: "", notes: "" });
        }}
        aria-label="Add Vasana Entry"
      >
        <div className="flex flex-col gap-4 w-full">
          <span className="text-3xl self-center" aria-hidden>🌱</span>
          <input
            type="date"
            className="border-2 border-rose bg-surface rounded-xl px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-gold text-lg shadow-sm text-zinc-900 placeholder-zinc-400"
            value={form.date}
            onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            required
            aria-label="Date"
          />
          <input
            type="text"
            placeholder="Habit (vasana)"
            className="border-2 border-primary bg-surface rounded-xl px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-rose text-lg shadow-sm text-zinc-900 placeholder-zinc-400"
            value={form.habit}
            onChange={e => setForm(f => ({ ...f, habit: e.target.value }))}
            required
            aria-label="Habit"
          />
          <input
            type="text"
            placeholder="Tendency"
            className="border-2 border-gold bg-surface rounded-xl px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary text-lg shadow-sm text-zinc-900 placeholder-zinc-400"
            value={form.tendency}
            onChange={e => setForm(f => ({ ...f, tendency: e.target.value }))}
            required
            aria-label="Tendency"
          />
          <input
            type="text"
            placeholder="Notes (e.g. Trigger, insight)"
            className="border-2 border-accent bg-surface rounded-xl px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-rose text-lg shadow-sm text-zinc-900 placeholder-zinc-400"
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            aria-label="Notes"
          />
          <button
            type="submit"
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-rose to-gold text-rose font-bold shadow-lg hover:from-gold hover:to-emerald focus:outline-none focus:ring-2 focus:ring-gold transition w-full"
            aria-label="Add Entry"
          >
            <span className="text-xl">➕</span> <span className="font-bold">Add</span>
          </button>
        </div>
      </form>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <VasanaTracker
          entries={entries}
          onAddEntry={addEntry}
        />
      )}
      <ul className="mt-4">
        {entries.map((entry) => (
          <li key={entry.id} className="flex items-center gap-2 text-sm">
            <span>{entry.date} - {entry.habit} - {entry.tendency} - {entry.notes}</span>
            <button onClick={() => deleteEntry(entry.id!)} className="text-red-600 hover:underline ml-2">Delete</button>
          </li>
        ))}
      </ul>
    </ModuleLayout>
  );
}
