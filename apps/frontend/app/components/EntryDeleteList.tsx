"use client";

interface EntryDeleteListProps<T extends { id?: string }> {
  entries: T[];
  onDelete: (id: string) => void;
  deleteLabel: string;
  renderText: (entry: T) => string;
}

export default function EntryDeleteList<T extends { id?: string }>({
  entries,
  onDelete,
  deleteLabel,
  renderText,
}: EntryDeleteListProps<T>) {
  return (
    <ul className="mt-4">
      {entries.map((entry) => (
        <li key={entry.id} className="flex items-center gap-2 text-sm">
          <span>{renderText(entry)}</span>
          <button
            onClick={() => entry.id && onDelete(entry.id)}
            className="text-red-600 hover:underline ml-2"
          >
            {deleteLabel}
          </button>
        </li>
      ))}
    </ul>
  );
}
