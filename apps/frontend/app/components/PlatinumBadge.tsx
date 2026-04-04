import Link from "next/link";

export default function PlatinumBadge() {
  return (
    <Link
      href="https://foreverlotus.com/awaricon"
      target="_blank"
      rel="noopener noreferrer"
      className="app-platinum-badge"
      aria-label="Awaricon Platinum readiness badge"
    >
      <span className="app-platinum-badge__label">AWARICON</span>
      <strong className="app-platinum-badge__title">PLATINUM</strong>
      <span className="app-platinum-badge__meta">Readiness</span>
    </Link>
  );
}