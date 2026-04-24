import type { ReactNode } from "react";
import { buildNoIndexMetadata } from "../lib/seo";

export const metadata = buildNoIndexMetadata({
  title: "Sign In to Buddhi Align Private Practice Workspace",
  description:
    "Use the protected Buddhi Align sign-in page to access private practice entries, reflection history, preferences, and account-specific spiritual growth tools.",
  path: "/sign-in",
});

export default function SignInLayout({ children }: { children: ReactNode }) {
  return children;
}
