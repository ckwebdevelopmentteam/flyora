"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Ensures that navigating between pages always opens at the top hero of the new page,
 * preventing retained scroll positions from previous pages.
 */
export function NavigationScrollHandler() {
  const pathname = usePathname();
  const isFirstMount = useRef(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Set scroll restoration to manual so the browser does not jump to previous scroll positions
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    // Scroll to top immediately on route change
    window.scrollTo(0, 0);
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;

    // A light auto-scroll to top to ensure dynamic layouts settle at the top hero
    const rafId = requestAnimationFrame(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: isFirstMount.current ? "instant" : "smooth",
      });
      isFirstMount.current = false;
    });

    return () => cancelAnimationFrame(rafId);
  }, [pathname]);

  return null;
}
