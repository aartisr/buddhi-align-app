"use client";

import { useEffect, useRef } from "react";
import { SessionProvider } from "next-auth/react";
import RequestFeedbackProvider from "./RequestFeedbackProvider";
import WebVitalsReporter from "./WebVitalsReporter";

const isClientObservabilityEnabled = process.env.NEXT_PUBLIC_OBSERVABILITY_CLIENT === "1";
const clarityProjectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID?.trim();

/**
 * Client-side session provider wrapper.
 * Placed here so the root layout (a Server Component) can include it.
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  const hasInitializedClarity = useRef(false);

  useEffect(() => {
    if (!clarityProjectId || hasInitializedClarity.current) {
      return;
    }

    hasInitializedClarity.current = true;

    const scriptId = `ms-clarity-${clarityProjectId}`;
    if (document.getElementById(scriptId)) {
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.async = true;
    script.src = `https://www.clarity.ms/tag/${encodeURIComponent(clarityProjectId)}`;
    script.onerror = () => {
      hasInitializedClarity.current = false;
    };
    document.head.appendChild(script);
  }, []);

  return (
    <SessionProvider>
      {isClientObservabilityEnabled ? <WebVitalsReporter /> : null}
      <RequestFeedbackProvider>{children}</RequestFeedbackProvider>
    </SessionProvider>
  );
}
