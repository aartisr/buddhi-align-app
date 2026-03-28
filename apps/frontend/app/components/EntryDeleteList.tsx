"use client";

interface EntryDeleteListProps<T extends { id?: string }> {
  entries: T[];
  onDelete: (id: string) => void | Promise<void>;
  deleteLabel: string;
  renderText: (entry: T) => string;
  deletingIds?: string[];
}

export default function EntryDeleteList<T extends { id?: string }>({
  entries,
  onDelete,
  deleteLabel,
  renderText,
  deletingIds = [],
}: EntryDeleteListProps<T>) {
  return (
    <ul className="mt-4">
      {entries.map((entry) => {
        const isDeleting = entry.id ? deletingIds.includes(entry.id) : false;

        return (
          <li key={entry.id} className="flex items-center gap-2 text-sm">
            <span>{renderText(entry)}</span>
            <button
              onClick={() => entry.id && onDelete(entry.id)}
              className="app-inline-action app-inline-action--danger ml-2"
              disabled={isDeleting}
              aria-busy={isDeleting}
            >
              {isDeleting ? (
                <>
                  <span className="app-inline-spinner" aria-hidden="true" />
                  <span>{deleteLabel}...</span>
                </>
              ) : (
                <span>{deleteLabel}</span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
