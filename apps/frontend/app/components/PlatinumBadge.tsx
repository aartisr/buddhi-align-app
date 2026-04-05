export default function PlatinumBadge({ size = "header" }: { size?: "header" | "footer" }) {
  return (
    <a
      href="https://www.foreverlotus.com/awaricon/legal"
      target="_blank"
      rel="noopener noreferrer"
      className={size === "footer" ? "app-awaricon-badge app-awaricon-badge--footer" : "app-platinum-badge"}
      aria-label="Awaricon Platinum compliance badge"
    >
      <img
        src="https://www.foreverlotus.com/api/awaricon/badge?tier=platinum&site=buddhi-align.foreverlotus.com&exp=1777948602&sig=aee9438c8794ded3617a4548592f29a0eb9d44cb1df8d83fb56192b37520eddf"
        alt="Awaricon Platinum compliance badge"
        width="180"
        height="180"
        loading="lazy"
        className={size === "footer" ? "app-awaricon-badge__image" : "app-platinum-badge__image"}
      />
    </a>
  );
}