"use client";

import { SessionProvider } from "next-auth/react";
import RequestFeedbackProvider from "./RequestFeedbackProvider";
import WebVitalsReporter from "./WebVitalsReporter";

const isClientObservabilityEnabled = process.env.NEXT_PUBLIC_OBSERVABILITY_CLIENT === "1";

/**
 * Client-side session provider wrapper.
 * Placed here so the root layout (a Server Component) can include it.
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {isClientObservabilityEnabled ? <WebVitalsReporter /> : null}
      <RequestFeedbackProvider>{children}</RequestFeedbackProvider>
    </SessionProvider>
  );
}
