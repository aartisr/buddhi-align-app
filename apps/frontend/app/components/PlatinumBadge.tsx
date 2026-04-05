import ComplianceBadge from "./ComplianceBadge";

type PlatinumBadgeProps = {
  size?: "header" | "footer";
};

export default function PlatinumBadge({ size = "header" }: PlatinumBadgeProps) {
  return (
    <ComplianceBadge
      variant={size}
      href="https://www.foreverlotus.com/awaricon/legal"
      src="/awaricon-platinum.svg"
      alt="Awaricon Platinum compliance badge"
      ariaLabel="Awaricon Platinum compliance badge"
      tierTag="Platinum"
    />
  );
}