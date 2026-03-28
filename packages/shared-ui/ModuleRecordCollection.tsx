import React from "react";

export interface ModuleRecordItem {
  id?: string;
  date: string;
  title: string;
  summary?: string;
  details?: string[];
  note?: string;
  accentClassName?: string;
}

export interface ModuleRecordCollectionProps {
  title: string;
  description: string;
  emptyState: string;
  entries: ModuleRecordItem[];
  deleteLabel?: string;
  onDelete?: (id: string) => void | Promise<void>;
  deletingIds?: string[];
}

export function ModuleRecordCollection({
  title,
  description,
  emptyState,
  entries,
  deleteLabel,
  onDelete,
  deletingIds = [],
}: ModuleRecordCollectionProps) {
  const sortedEntries = [...entries].sort((left, right) => right.date.localeCompare(left.date));

  return (
    <section className="app-records-shell mb-12">
      <div className="app-records-header">
        <div>
          <h2 className="app-section-heading text-2xl font-semibold mb-2">{title}</h2>
          <p className="app-copy">{description}</p>
        </div>
        {sortedEntries.length > 0 ? (
          <div className="app-records-count" aria-label={`${sortedEntries.length} records`}>
            {sortedEntries.length} records
          </div>
        ) : null}
      </div>

      {sortedEntries.length === 0 ? (
        <p className="app-empty-state">{emptyState}</p>
      ) : (
        <ul className="app-records-grid" role="list">
          {sortedEntries.map((entry, index) => {
            const isDeleting = entry.id ? deletingIds.includes(entry.id) : false;

            return (
              <li key={entry.id ?? `${entry.date}-${index}`} className="app-record-card">
                <div className="app-record-card__header">
                  <span className="app-record-date">{entry.date}</span>
                  {deleteLabel && onDelete && entry.id ? (
                    <button
                      type="button"
                      className="app-inline-action app-inline-action--danger"
                      onClick={() => onDelete(entry.id as string)}
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
                  ) : null}
                </div>

                <div className="app-record-card__body">
                  <h3 className="app-record-card__title">{entry.title}</h3>
                  {entry.summary ? <p className="app-record-card__summary">{entry.summary}</p> : null}

                  {entry.details && entry.details.length > 0 ? (
                    <div className="app-record-card__details">
                      {entry.details.map((detail) => (
                        <span
                          key={detail}
                          className={`app-record-detail-pill ${entry.accentClassName ?? ""}`.trim()}
                        >
                          {detail}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  {entry.note ? <p className="app-record-card__note">{entry.note}</p> : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}