"use client";
import { JnanaReflection } from "@buddhi-align/shared-ui";
import ModuleLayout from "../components/ModuleLayout";
import { useJnanaReflectionEntries } from "../hooks/useJnanaReflectionEntries";
import { useState } from "react";

export default function JnanaReflectionPage() {
  const { entries, loading, addEntry, deleteEntry } = useJnanaReflectionEntries();
  const [form, setForm] = useState({ date: "", insight: "", contemplation: "" });

  return (
    <ModuleLayout title="Jnana Reflection">
      <form
        className="mb-8 flex flex-col gap-4 p-6 rounded-2xl bg-gradient-to-br from-emerald/20 via-gold/10 to-primary/10 border-2 border-primary shadow-lg max-w-xl mx-auto"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!form.date || !form.insight || !form.contemplation) return;
          await addEntry(form);
          setForm({ date: "", insight: "", contemplation: "" });
        }}
        aria-label="Add Jnana Reflection Entry"
      >
        <div className="flex flex-col gap-4 w-full">
          <span className="text-3xl self-center" aria-hidden>🧘‍♂️</span>
          <input
            type="date"
            className="border-2 border-primary bg-surface rounded-xl px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-gold text-lg shadow-sm text-zinc-900 placeholder-zinc-400"
            value={form.date}
            onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            required
            aria-label="Date"
          />
          <input
            type="text"
            placeholder="Insight (e.g. True knowledge...)"
            className="border-2 border-emerald bg-surface rounded-xl px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary text-lg shadow-sm text-zinc-900 placeholder-zinc-400"
            value={form.insight}
            onChange={e => setForm(f => ({ ...f, insight: e.target.value }))}
            required
            aria-label="Insight"
          />
          <input
            type="text"
            placeholder="Contemplation (e.g. What is my true nature?)"
            className="border-2 border-accent bg-surface rounded-xl px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-emerald text-lg shadow-sm text-zinc-900 placeholder-zinc-400"
            value={form.contemplation}
            onChange={e => setForm(f => ({ ...f, contemplation: e.target.value }))}
            required
            aria-label="Contemplation"
          />
          <button
            type="submit"
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-primary to-emerald text-primary font-bold shadow-lg hover:from-gold hover:to-emerald focus:outline-none focus:ring-2 focus:ring-gold transition w-full"
            aria-label="Add Entry"
          >
            <span className="text-xl">➕</span> <span className="font-bold">Add</span>
          </button>
        </div>
      </form>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <JnanaReflection
          entries={entries}
          onAddEntry={addEntry}
        />
      )}
      <ul className="mt-4">
        {entries.map((entry) => (
          <li key={entry.id} className="flex items-center gap-2 text-sm">
            <span>{entry.date} - {entry.insight} - Contemplation: {entry.contemplation}</span>
            <button onClick={() => deleteEntry(entry.id!)} className="text-red-600 hover:underline ml-2">Delete</button>
          </li>
        ))}
      </ul>
    </ModuleLayout>
  );
}
