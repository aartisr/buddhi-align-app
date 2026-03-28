"use client";

import { SessionProvider } from "next-auth/react";

/**
 * Client-side session provider wrapper.
 * Placed here so the root layout (a Server Component) can include it.
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
