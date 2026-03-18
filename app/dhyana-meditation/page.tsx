"use client";
import { DhyanaMeditation } from "@buddhi-align/shared-ui";
import ModuleLayout from "../components/ModuleLayout";
import { useDhyanaMeditationEntries } from "../hooks/useDhyanaMeditationEntries";
import { useState } from "react";

export default function DhyanaMeditationPage() {
  const { entries, loading, addEntry, deleteEntry } = useDhyanaMeditationEntries();
  const [form, setForm] = useState({ date: "", type: "", duration: 0, notes: "" });

  return (
    <ModuleLayout title="Dhyana Meditation">
      <form
        className="mb-8 flex flex-col gap-4 p-6 rounded-2xl bg-gradient-to-br from-emerald/20 via-gold/10 to-primary/10 border-2 border-emerald shadow-lg max-w-xl mx-auto"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!form.date || !form.type || !form.duration) return;
          await addEntry(form);
          setForm({ date: "", type: "", duration: 0, notes: "" });
        }}
        aria-label="Add Dhyana Meditation Entry"
      >
        <div className="flex flex-col gap-4 w-full">
          <span className="text-3xl self-center" aria-hidden>🧘‍♀️</span>
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
            placeholder="Type (e.g. Guided, Self-led)"
            className="border-2 border-primary bg-surface rounded-xl px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-emerald text-lg shadow-sm text-zinc-900 placeholder-zinc-400"
            value={form.type}
            onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
            required
            aria-label="Type"
          />
          <input
            type="number"
            min="1"
            placeholder="Duration (min)"
            className="border-2 border-gold bg-surface rounded-xl px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary text-lg shadow-sm text-zinc-900 placeholder-zinc-400"
            value={form.duration || ""}
            onChange={e => setForm(f => ({ ...f, duration: Number(e.target.value) }))}
            required
            aria-label="Duration"
          />
          <input
            type="text"
            placeholder="Notes (e.g. Deep relaxation)"
            className="border-2 border-accent bg-surface rounded-xl px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-emerald text-lg shadow-sm text-zinc-900 placeholder-zinc-400"
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            aria-label="Notes"
          />
          <button
            type="submit"
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald to-gold text-emerald font-bold shadow-lg hover:from-gold hover:to-primary focus:outline-none focus:ring-2 focus:ring-gold transition w-full"
            aria-label="Add Entry"
          >
            <span className="text-xl">➕</span> <span className="font-bold">Add</span>
          </button>
        </div>
      </form>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <DhyanaMeditation
          entries={entries}
          onAddEntry={addEntry}
        />
      )}
      <ul className="mt-4">
        {entries.map((entry) => (
          <li key={entry.id} className="flex items-center gap-2 text-sm">
            <span>{entry.date} - {entry.type} - {entry.duration} min - {entry.notes}</span>
            <button onClick={() => deleteEntry(entry.id!)} className="text-red-600 hover:underline ml-2">Delete</button>
          </li>
        ))}
      </ul>
    </ModuleLayout>
  );
}
