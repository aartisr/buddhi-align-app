import ComplianceBadge from "./ComplianceBadge";
import { translate, DEFAULT_LOCALE } from "@/app/i18n/config";

type PlatinumBadgeProps = {
  size?: "header" | "footer";
};

export default function PlatinumBadge({ size = "header" }: PlatinumBadgeProps) {
  return (
    <ComplianceBadge
      variant={size}
      href="https://www.foreverlotus.com/awaricon/legal"
      src="/awaricon-platinum.svg"
      alt={translate(DEFAULT_LOCALE, "compliance.badgeAlt")}
      ariaLabel={translate(DEFAULT_LOCALE, "compliance.badgeAria")}
      tierTag={size === "header" ? translate(DEFAULT_LOCALE, "compliance.tier.platinum") : undefined}
    />
  );
}