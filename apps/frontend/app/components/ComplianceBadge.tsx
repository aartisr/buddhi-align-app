"use client";

import Image from "next/image";
import { useEffect, useId, useMemo, useState } from "react";
import { translate, DEFAULT_LOCALE } from "@/app/i18n/config";

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
              <h2 id={titleId}>{translate(DEFAULT_LOCALE, "compliance.title")}</h2>
              <button
                type="button"
                className="app-compliance-modal__close"
                onClick={() => setIsDialogOpen(false)}
                aria-label={translate(DEFAULT_LOCALE, "compliance.closeAria")}
              >
                ×
              </button>
            </header>

            <p id={descriptionId} className="app-compliance-modal__description">
              {translate(DEFAULT_LOCALE, "compliance.description")}
            </p>

            <div className="app-compliance-modal__content">
              <div className="app-compliance-modal__badge">
                <Image
                  src={src}
                  alt={alt}
                  width={88}
                  height={88}
                />
                <div>
                  <p className="app-compliance-modal__kicker">{translate(DEFAULT_LOCALE, "compliance.kicker")}</p>
                  <p className="app-compliance-modal__value">
                    Awaricon {tierTag ?? translate(DEFAULT_LOCALE, "compliance.verified")}
                  </p>
                </div>
              </div>
              <ul className="app-compliance-modal__list">
                <li>{translate(DEFAULT_LOCALE, "compliance.list.item1")}</li>
                <li>{translate(DEFAULT_LOCALE, "compliance.list.item2")}</li>
                <li>{translate(DEFAULT_LOCALE, "compliance.list.item3")}</li>
              </ul>
            </div>

            <div className="app-compliance-modal__actions">
              <button
                type="button"
                className="app-compliance-modal__secondary"
                onClick={() => setIsDialogOpen(false)}
              >
                {translate(DEFAULT_LOCALE, "compliance.close")}
              </button>
              <button
                type="button"
                className="app-compliance-modal__primary"
                onClick={openOfficialPage}
              >
                {translate(DEFAULT_LOCALE, "compliance.openOfficial")}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
