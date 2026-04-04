"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useReportWebVitals } from "next/web-vitals";

import { logEvent } from "../lib/logEvent";

export default function WebVitalsReporter() {
  const pathname = usePathname();

  useReportWebVitals((metric) => {
    logEvent("web_vital", {
      id: metric.id,
      name: metric.name,
      value: Number(metric.value.toFixed(2)),
      rating: metric.rating,
      navigationType: metric.navigationType,
      pathname,
    });
  });

  useEffect(() => {
    if (!pathname) return;
    const start = performance.now();
    const frame1 = requestAnimationFrame(() => {
      const frame2 = requestAnimationFrame(() => {
        const routeRenderMs = performance.now() - start;
        logEvent("route_render_complete", {
          pathname,
          routeRenderMs: Number(routeRenderMs.toFixed(2)),
        });
      });

      return () => cancelAnimationFrame(frame2);
    });

    return () => cancelAnimationFrame(frame1);
  }, [pathname]);

  return null;
}