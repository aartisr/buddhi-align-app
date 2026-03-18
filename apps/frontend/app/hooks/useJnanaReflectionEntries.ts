import { useEffect, useState } from "react";

export interface JnanaReflectionEntry {
  id?: string;
  date: string;
  insight: string;
  contemplation: string;
}

export function useJnanaReflectionEntries() {
  const [entries, setEntries] = useState<JnanaReflectionEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:4000/api/jnana")
      .then((res) => res.json())
      .then((data) => {
        setEntries(data);
        setLoading(false);
      });
  }, []);

  const addEntry = async (entry: Omit<JnanaReflectionEntry, "id">) => {
    const res = await fetch("http://localhost:4000/api/jnana", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });
    const newEntry = await res.json();
    setEntries((prev) => [...prev, newEntry]);
  };

  const deleteEntry = async (id: string) => {
    await fetch(`http://localhost:4000/api/jnana/${id}`, { method: "DELETE" });
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  return { entries, loading, addEntry, deleteEntry };
}
