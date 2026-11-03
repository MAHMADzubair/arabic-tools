"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const TOOL_ROUTE = /(?:calculator|generator|checker|converter|compressor|resizer|editor|counter|planner|estimator)/i;

function send(name, params = {}) {
  if (typeof window !== "undefined" && typeof window.trackEvent === "function") {
    window.trackEvent(name, params);
  }
}

function routeName(path) {
  return String(path || "/").split("/").filter(Boolean).pop() || "home";
}

/**
 * Public-site GA4 engagement tracking.
 * Never records input values, names, emails, query strings, or other form data.
 */
export default function PublicAnalyticsTracker() {
  const pathname = usePathname();
  const previousPath = useRef(pathname);
  const startedPath = useRef("");

  useEffect(() => {
    const current = pathname || "/";
    const isTool = TOOL_ROUTE.test(current);

    if (previousPath.current !== current) {
      send("page_view", { page_path: current, page_title: document.title });
      previousPath.current = current;
      startedPath.current = "";
    }

    if (isTool) {
      send("tool_view", {
        tool_name: routeName(current),
        page_path: current,
      });
    }
  }, [pathname]);

  useEffect(() => {
    const onFocusIn = (event) => {
      const target = event.target;
      if (!target || !target.closest) return;
      if (!target.closest("main")) return;
      if (!target.closest("input, select, textarea, [contenteditable='true']")) return;

      const current = window.location.pathname || "/";
      if (!TOOL_ROUTE.test(current) || startedPath.current === current) return;

      startedPath.current = current;
      send("tool_start", {
        tool_name: routeName(current),
        page_path: current,
      });
    };

    const onClick = (event) => {
      const anchor = event.target?.closest?.("a[href]");
      if (!anchor || !anchor.closest("main")) return;

      let destination;
      try {
        destination = new URL(anchor.href, window.location.origin);
      } catch {
        return;
      }

      if (destination.origin !== window.location.origin) return;

      const sourcePath = window.location.pathname || "/";
      const targetPath = destination.pathname;
      if (
        sourcePath !== targetPath &&
        TOOL_ROUTE.test(sourcePath) &&
        TOOL_ROUTE.test(targetPath)
      ) {
        send("related_tool_click", {
          source_tool: routeName(sourcePath),
          target_tool: routeName(targetPath),
          source_path: sourcePath,
          target_path: targetPath,
        });
      }
    };

    document.addEventListener("focusin", onFocusIn, true);
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("focusin", onFocusIn, true);
      document.removeEventListener("click", onClick, true);
    };
  }, []);

  return null;
}
