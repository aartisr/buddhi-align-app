"use client";

import React, { useState } from "react";

type LazyDetailsProps = {
  summary: string;
  className?: string;
  children: React.ReactNode;
};

export default function LazyDetails({ summary, className, children }: LazyDetailsProps) {
  const [hasOpened, setHasOpened] = useState(false);

  return (
    <details
      className={className}
      onToggle={(event) => {
        if ((event.currentTarget as HTMLDetailsElement).open) {
          setHasOpened(true);
        }
      }}
    >
      <summary className="app-guided-flow-link cursor-pointer">{summary}</summary>
      {hasOpened ? <div className="mt-3">{children}</div> : null}
    </details>
  );
}
