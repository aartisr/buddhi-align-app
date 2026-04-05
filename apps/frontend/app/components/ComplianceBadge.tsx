"use client";

import Image from "next/image";
import { useEffect, useId, useMemo, useState } from "react";

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const titleId = useId();
  const descriptionId = useId();
  const dialogId = useMemo(() => `compliance-dialog-${titleId.replace(/[:]/g, "")}`, [titleId]);

  useEffect(() => {
    if (!isDialogOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsDialogOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isDialogOpen]);

  const openOfficialPage = () => {
    window.open(href, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <button
        type="button"
        className={BADGE_CLASS_BY_VARIANT[variant]}
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        aria-controls={dialogId}
        onClick={() => setIsDialogOpen(true)}
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={IMAGE_CLASS_BY_VARIANT[variant]}
        />
        {tierTag ? <span className={TAG_CLASS_BY_VARIANT[variant]}>{tierTag}</span> : null}
      </button>

      {isDialogOpen ? (
        <div
          className="app-compliance-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsDialogOpen(false);
            }
          }}
        >
          <section
            id={dialogId}
            className="app-compliance-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
          >
            <header className="app-compliance-modal__header">
              <h2 id={titleId}>Awaricon Compliance Details</h2>
              <button
                type="button"
                className="app-compliance-modal__close"
                onClick={() => setIsDialogOpen(false)}
                aria-label="Close compliance details"
              >
                ×
              </button>
            </header>

            <p id={descriptionId} className="app-compliance-modal__description">
              Viewing details in a popup keeps users on this page. If your browser blocks embedded content, use the
              external link button below.
            </p>

            <div className="app-compliance-modal__frame-wrap">
              <iframe
                src={href}
                title="Awaricon compliance legal details"
                className="app-compliance-modal__frame"
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>

            <div className="app-compliance-modal__actions">
              <button
                type="button"
                className="app-compliance-modal__secondary"
                onClick={() => setIsDialogOpen(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="app-compliance-modal__primary"
                onClick={openOfficialPage}
              >
                Open official page
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
