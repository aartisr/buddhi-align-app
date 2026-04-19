import type { ReactNode } from "react";
import { buildNoIndexMetadata } from "../lib/seo";

export const metadata = buildNoIndexMetadata({
  title: "Sign In",
  description: "Private sign-in flow for Buddhi Align accounts.",
  path: "/sign-in",
});

export default function SignInLayout({ children }: { children: ReactNode }) {
  return children;
}
