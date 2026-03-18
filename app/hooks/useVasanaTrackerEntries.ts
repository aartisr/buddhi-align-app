import { useEffect, useState } from "react";

export interface VasanaTrackerEntry {
  id?: string;
  date: string;
  habit: string;
  tendency: string;
  notes: string;
}

export function useVasanaTrackerEntries() {
  const [entries, setEntries] = useState<VasanaTrackerEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:4000/api/vasana")
      .then((res) => res.json())
      .then((data) => {
        setEntries(data);
        setLoading(false);
      });
  }, []);

  const addEntry = async (entry: Omit<VasanaTrackerEntry, "id">) => {
    const res = await fetch("http://localhost:4000/api/vasana", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });
    const newEntry = await res.json();
    setEntries((prev) => [...prev, newEntry]);
  };

  const deleteEntry = async (id: string) => {
    await fetch(`http://localhost:4000/api/vasana/${id}`, { method: "DELETE" });
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  return { entries, loading, addEntry, deleteEntry };
}
