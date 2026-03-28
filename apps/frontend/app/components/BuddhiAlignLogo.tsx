import React from "react";

export default function BuddhiAlignLogo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 140 44"
      role="img"
      aria-label="Buddhi Align logo"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="ba-logo-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4338ca" />
          <stop offset="100%" stopColor="#0f766e" />
        </linearGradient>
        <linearGradient id="ba-logo-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>

      <rect x="1" y="1" width="42" height="42" rx="12" fill="url(#ba-logo-bg)" />
      <path d="M22 9 L27 18 L17 18 Z" fill="url(#ba-logo-mark)" />
      <circle cx="22" cy="23" r="5.2" fill="#fef08a" />
      <path d="M13 32 C16 27, 20 27, 22 31 C24 27, 28 27, 31 32" stroke="#fef3c7" strokeWidth="2.5" fill="none" strokeLinecap="round" />

      <text x="52" y="19" fill="#312e81" fontSize="12" fontWeight="700" fontFamily="'Trebuchet MS', Verdana, sans-serif" letterSpacing="1.1">
        BUDDHI
      </text>
      <text x="52" y="34" fill="#0f766e" fontSize="14" fontWeight="700" fontFamily="'Trebuchet MS', Verdana, sans-serif" letterSpacing="1.1">
        ALIGN
      </text>
    </svg>
  );
}
