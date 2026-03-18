import { useEffect, useState } from "react";

export interface DhyanaMeditationEntry {
  id?: string;
  date: string;
  type: string;
  duration: number;
  notes: string;
}

export function useDhyanaMeditationEntries() {
  const [entries, setEntries] = useState<DhyanaMeditationEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:4000/api/dhyana")
      .then((res) => res.json())
      .then((data) => {
        setEntries(data);
        setLoading(false);
      });
  }, []);

  const addEntry = async (entry: Omit<DhyanaMeditationEntry, "id">) => {
    const res = await fetch("http://localhost:4000/api/dhyana", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });
    const newEntry = await res.json();
    setEntries((prev) => [...prev, newEntry]);
  };

  const deleteEntry = async (id: string) => {
    await fetch(`http://localhost:4000/api/dhyana/${id}`, { method: "DELETE" });
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  return { entries, loading, addEntry, deleteEntry };
}
