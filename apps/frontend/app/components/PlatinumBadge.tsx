export default function PlatinumBadge({ size = "header" }: { size?: "header" | "footer" }) {
  return (
    <a
      href="https://www.foreverlotus.com/awaricon/legal"
      target="_blank"
      rel="noopener noreferrer"
      className={size === "footer" ? "app-awaricon-badge app-awaricon-badge--footer" : "app-platinum-badge"}
      aria-label="Awaricon Gold compliance badge"
    >
      <img
        src="https://www.foreverlotus.com/api/awaricon/badge?tier=gold&site=buddhi-align.foreverlotus.com&exp=1777946923&sig=e1d3477e464e147d953ae2b173763c38f5c7f1e92f6fc144e2fc7e0171e8cc4a"
        alt="Awaricon Gold compliance badge"
        width="180"
        height="180"
        loading="lazy"
        className={size === "footer" ? "app-awaricon-badge__image" : "app-platinum-badge__image"}
      />
    </a>
  );
}