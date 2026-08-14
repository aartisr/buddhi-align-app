import React from "react";

type AwariconPlatinumMarkProps = {
  className?: string;
};

/**
 * Inline by design: the compliance mark remains visible even when a deployment
 * does not expose nested-workspace public assets as standalone files.
 */
export default function AwariconPlatinumMark({ className }: AwariconPlatinumMarkProps) {
  return (
    <svg
      viewBox="0 0 360 360"
      className={className}
      role="img"
      aria-label="Awaricon Platinum badge"
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="aw-platinum-halo" cx="50%" cy="45%" r="58%">
          <stop offset="0%" stopColor="#b8d8ff" stopOpacity="0.95" />
          <stop offset="65%" stopColor="#9ee6ff" stopOpacity="0.38" />
          <stop offset="100%" stopColor="#9ee6ff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="aw-platinum-grad" x1="10%" y1="8%" x2="88%" y2="92%">
          <stop offset="0%" stopColor="#dff7ff" />
          <stop offset="48%" stopColor="#b8d8ff" />
          <stop offset="100%" stopColor="#9ee6ff" />
        </linearGradient>
        <linearGradient id="aw-platinum-shine" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.7" />
          <stop offset="40%" stopColor="#ffffff" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <circle cx="180" cy="180" r="156" fill="url(#aw-platinum-halo)" />
      <circle cx="180" cy="180" r="132" fill="#0b0c15" fillOpacity="0.92" stroke="url(#aw-platinum-grad)" strokeWidth="8" />
      <circle cx="180" cy="180" r="111" fill="#0a0b13" fillOpacity="0.85" stroke="#ffffff" strokeOpacity="0.08" />
      <g fill="url(#aw-platinum-grad)" opacity="0.82" stroke="#ffffff" strokeOpacity="0.16" strokeWidth="1.2" transform="translate(180 180)">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((rotation) => <path key={rotation} d="M0,-66 C10,-46 10,-30 0,-16 C-10,-30 -10,-46 0,-66" transform={`rotate(${rotation})`} />)}
      </g>
      <circle cx="180" cy="180" r="52" fill="#07080e" fillOpacity="0.94" stroke="url(#aw-platinum-grad)" strokeWidth="3" />
      <path d="M180 148 L191 170 L215 174 L197 191 L201 215 L180 204 L159 215 L163 191 L145 174 L169 170 Z" fill="url(#aw-platinum-grad)" stroke="#080910" strokeOpacity="0.45" strokeWidth="2" />
      <g fill="#fff5c6" opacity="0.9">
        <path d="M180 118 L184 126 L193 127 L186 133 L188 142 L180 138 L172 142 L174 133 L167 127 L176 126 Z" />
        <path d="M226 180 L230 188 L239 189 L232 195 L234 204 L226 200 L218 204 L220 195 L213 189 L222 188 Z" />
        <path d="M134 180 L138 188 L147 189 L140 195 L142 204 L134 200 L126 204 L128 195 L121 189 L130 188 Z" />
      </g>
      <circle cx="180" cy="180" r="18" fill="url(#aw-platinum-shine)" opacity="0.5" />
      <text x="180" y="292" textAnchor="middle" fill="#dff7ff" fontSize="16" fontWeight="700" letterSpacing="2.6">PLATINUM</text>
      <text x="180" y="336" textAnchor="middle" fill="#ffffff" fillOpacity="0.42" fontSize="8" letterSpacing="1.2">© 2026 Forever Lotus. All rights reserved.</text>
    </svg>
  );
}
