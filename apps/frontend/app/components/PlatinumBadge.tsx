export default function PlatinumBadge() {
  return (
    <a
      href="https://www.foreverlotus.com/awaricon/legal"
      target="_blank"
      rel="noopener noreferrer"
      className="app-platinum-badge"
      aria-label="Awaricon Platinum compliance badge"
    >
      <img
        src="https://www.foreverlotus.com/api/awaricon/badge?tier=platinum"
        alt="Awaricon Platinum compliance badge"
        width="180"
        height="180"
        loading="lazy"
        className="app-platinum-badge__image"
      />
    </a>
  );
}