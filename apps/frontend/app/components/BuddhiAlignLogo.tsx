import React from "react";
import { translate, DEFAULT_LOCALE } from "@/app/i18n/config";

export default function BuddhiAlignLogo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 140 44"
      role="img"
      aria-label={translate(DEFAULT_LOCALE, "logo.buddhiAlignAria")}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <image href="/buddhi-align-icon.svg" width="44" height="44" aria-hidden="true" />

      <text x="52" y="19" fill="#312e81" fontSize="12" fontWeight="700" fontFamily="'Trebuchet MS', Verdana, sans-serif" letterSpacing="1.1">
        BUDDHI
      </text>
      <text x="52" y="34" fill="#0f766e" fontSize="14" fontWeight="700" fontFamily="'Trebuchet MS', Verdana, sans-serif" letterSpacing="1.1">
        ALIGN
      </text>
    </svg>
  );
}
