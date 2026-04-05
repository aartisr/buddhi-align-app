import Image from "next/image";

type ComplianceBadgeVariant = "header" | "footer";

type ComplianceBadgeProps = {
  variant?: ComplianceBadgeVariant;
  href: string;
  src: string;
  alt: string;
  ariaLabel: string;
  tierTag?: string;
  width?: number;
  height?: number;
};

const BADGE_CLASS_BY_VARIANT: Record<ComplianceBadgeVariant, string> = {
  header: "app-platinum-badge app-platinum-badge--header",
  footer: "app-awaricon-badge app-awaricon-badge--footer",
};

const IMAGE_CLASS_BY_VARIANT: Record<ComplianceBadgeVariant, string> = {
  header: "app-platinum-badge__image",
  footer: "app-awaricon-badge__image",
};

const TAG_CLASS_BY_VARIANT: Record<ComplianceBadgeVariant, string> = {
  header: "app-platinum-badge__label",
  footer: "app-awaricon-badge__tag",
};

export default function ComplianceBadge({
  variant = "header",
  href,
  src,
  alt,
  ariaLabel,
  tierTag,
  width = 180,
  height = 180,
}: ComplianceBadgeProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={BADGE_CLASS_BY_VARIANT[variant]}
      aria-label={ariaLabel}
    >
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={IMAGE_CLASS_BY_VARIANT[variant]}
      />
      {tierTag ? <span className={TAG_CLASS_BY_VARIANT[variant]}>{tierTag}</span> : null}
    </a>
  );
}
