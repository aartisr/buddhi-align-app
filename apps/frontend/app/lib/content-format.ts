/**
 * Shared, presentation-safe formatting for public content previews and metadata.
 */
export function fitDescription(value: string, maxLength = 170): string {
  const trimmed = value.replace(/\s+/g, " ").trim();
  if (trimmed.length <= maxLength) return trimmed;

  return `${trimmed.slice(0, maxLength - 3).replace(/\s+\S*$/, "").trim()}.`;
}

export function formatPublicDate(value: string | undefined): string | undefined {
  if (!value) return undefined;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
