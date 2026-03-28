"use client";

import { SessionProvider } from "next-auth/react";
import RequestFeedbackProvider from "./RequestFeedbackProvider";

/**
 * Client-side session provider wrapper.
 * Placed here so the root layout (a Server Component) can include it.
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <RequestFeedbackProvider>{children}</RequestFeedbackProvider>
    </SessionProvider>
  );
}
