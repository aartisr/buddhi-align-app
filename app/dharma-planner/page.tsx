"use client";
import { DharmaPlanner } from "@buddhi-align/shared-ui";
import ModuleLayout from "../components/ModuleLayout";
import { useDharmaPlannerEntries } from "../hooks/useDharmaPlannerEntries";
import { useState } from "react";

export default function DharmaPlannerPage() {
  const { entries, loading, addEntry, deleteEntry } = useDharmaPlannerEntries();
  const [form, setForm] = useState({ date: "", goal: "", action: "", status: "" });

  return (
    <ModuleLayout title="Dharma Planner">
      <form
        className="mb-8 flex flex-col gap-4 p-6 rounded-2xl bg-gradient-to-br from-indigo/20 via-gold/10 to-primary/10 border-2 border-indigo shadow-lg max-w-xl mx-auto"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!form.date || !form.goal || !form.action) return;
          await addEntry(form);
          setForm({ date: "", goal: "", action: "", status: "" });
        }}
        aria-label="Add Dharma Plan"
      >
        <div className="flex flex-col gap-4 w-full">
          <span className="text-3xl self-center" aria-hidden>📜</span>
          <input
            type="date"
            className="border-2 border-indigo bg-surface rounded-xl px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-gold text-lg shadow-sm text-zinc-900 placeholder-zinc-400"
            value={form.date}
            onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
            required
            aria-label="Date"
          />
          <input
            type="text"
            placeholder="Goal (dharma)"
            className="border-2 border-primary bg-surface rounded-xl px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo text-lg shadow-sm text-zinc-900 placeholder-zinc-400"
            value={form.goal}
            onChange={e => setForm(f => ({ ...f, goal: e.target.value }))}
            required
            aria-label="Goal"
          />
          <input
            type="text"
            placeholder="Action Plan"
            className="border-2 border-gold bg-surface rounded-xl px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary text-lg shadow-sm text-zinc-900 placeholder-zinc-400"
            value={form.action}
            onChange={e => setForm(f => ({ ...f, action: e.target.value }))}
            required
            aria-label="Action"
          />
          <input
            type="text"
            placeholder="Status (e.g. Planned, In Progress, Done)"
            className="border-2 border-accent bg-surface rounded-xl px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo text-lg shadow-sm text-zinc-900 placeholder-zinc-400"
            value={form.status}
            onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
            aria-label="Status"
          />
          <button
            type="submit"
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-indigo to-gold text-indigo font-bold shadow-lg hover:from-gold hover:to-primary focus:outline-none focus:ring-2 focus:ring-gold transition w-full"
            aria-label="Add Plan"
          >
            <span className="text-xl">➕</span> <span className="font-bold">Add</span>
          </button>
        </div>
      </form>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <DharmaPlanner
          entries={entries}
          onAddEntry={addEntry}
        />
      )}
      <ul className="mt-4">
        {entries.map((entry) => (
          <li key={entry.id} className="flex items-center gap-2 text-sm">
            <span>{entry.date} - {entry.goal} - {entry.action} - {entry.status}</span>
            <button onClick={() => deleteEntry(entry.id!)} className="text-red-600 hover:underline ml-2">Delete</button>
          </li>
        ))}
      </ul>
    </ModuleLayout>
  );
}
