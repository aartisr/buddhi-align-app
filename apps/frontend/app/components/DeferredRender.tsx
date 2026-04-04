"use client";

import React, { useEffect, useRef, useState } from "react";

interface DeferredRenderProps {
  children: React.ReactNode;
  minHeightClassName?: string;
  rootMargin?: string;
}

export default function DeferredRender({
  children,
  minHeightClassName = "min-h-[220px]",
  rootMargin = "240px 0px",
}: DeferredRenderProps) {
  const [isVisible, setIsVisible] = useState(false);
  const anchorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isVisible || !anchorRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );

    observer.observe(anchorRef.current);
    return () => observer.disconnect();
  }, [isVisible, rootMargin]);

  return (
    <div ref={anchorRef}>
      {isVisible ? children : <div className={`app-stat-skeleton rounded-2xl ${minHeightClassName}`} aria-hidden="true" />}
    </div>
  );
}