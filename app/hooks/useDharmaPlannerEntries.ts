import { useEffect, useState } from "react";

export interface DharmaPlannerEntry {
  id?: string;
  date: string;
  goal: string;
  action: string;
  status: string;
}

export function useDharmaPlannerEntries() {
  const [entries, setEntries] = useState<DharmaPlannerEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:4000/api/dharma")
      .then((res) => res.json())
      .then((data) => {
        setEntries(data);
        setLoading(false);
      });
  }, []);

  const addEntry = async (entry: Omit<DharmaPlannerEntry, "id">) => {
    const res = await fetch("http://localhost:4000/api/dharma", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });
    const newEntry = await res.json();
    setEntries((prev) => [...prev, newEntry]);
  };

  const deleteEntry = async (id: string) => {
    await fetch(`http://localhost:4000/api/dharma/${id}`, { method: "DELETE" });
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  return { entries, loading, addEntry, deleteEntry };
}
