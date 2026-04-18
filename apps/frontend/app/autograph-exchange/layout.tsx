import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { isAutographFeatureEnabled } from "@/app/lib/autographs/feature";
import "./autograph-exchange.css";

export default function AutographExchangeLayout({ children }: { children: ReactNode }) {
  if (!isAutographFeatureEnabled()) {
    notFound();
  }

  return children;
}
