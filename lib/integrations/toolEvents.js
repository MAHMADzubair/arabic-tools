/**
 * lib/integrations/toolEvents.js
 *
 * Privacy-preserving aggregate tool telemetry & conversion funnel adapter.
 * Strictly anonymous: NEVER stores or accepts salary inputs, gratuity amounts,
 * personal identifiers, or calculation parameters.
 *
 * Reuses GA4 custom events if available, or reports pending telemetry review.
 */

import { getGa4Config } from "./ga4.js";
import { getGoogleServiceAccountAccessToken } from "./googleAuth.js";
import { getActiveTools } from "../registry.js";

const GA4_SCOPE = "https://www.googleapis.com/auth/analytics.readonly";

export async function getToolUsageReport(range = "7d") {
  const config = getGa4Config();
  const allTools = getActiveTools();

  // If GA4 is not configured, report honest disconnected status
  if (!config.isConfigured) {
    return {
      status: "disconnected",
      reason: "telemetry_not_configured",
      error: "GA4 integration is not configured. Real tool usage telemetry is offline.",
      data: null,
      registeredToolsCount: allTools.length,
    };
  }

  const auth = await getGoogleServiceAccountAccessToken({
    clientEmail: config.clientEmail,
    privateKey: config.privateKey,
    scopes: GA4_SCOPE,
  });

  if (!auth.ok) {
    return {
      status: "error",
      reason: auth.error,
      error: "Authentication to GA4 Data API failed.",
      data: null,
      registeredToolsCount: allTools.length,
    };
  }

  const endpoint = `https://analyticsdata.googleapis.com/v1beta/properties/${config.propertyId}:runReport`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${auth.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        dateRanges: [{ startDate: range === "30d" ? "30daysAgo" : "7daysAgo", endDate: "today" }],
        dimensions: [{ name: "pagePath" }],
        metrics: [{ name: "screenPageViews" }, { name: "activeUsers" }],
        dimensionFilter: {
          filter: {
            fieldName: "pagePath",
            stringFilter: {
              matchType: "CONTAINS",
              value: "/",
            },
          },
        },
        limit: 100,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`GA4 tool usage query error: HTTP ${res.status}`);
    }

    const payload = await res.json();
    const rows = payload.rows || [];

    const toolMetricsMap = new Map();
    rows.forEach((r) => {
      const path = r.dimensionValues?.[0]?.value || "";
      const views = parseInt(r.metricValues?.[0]?.value || "0", 10);
      const users = parseInt(r.metricValues?.[1]?.value || "0", 10);
      toolMetricsMap.set(path, { views, users });
    });

    const toolUsage = allTools.map((t) => {
      const stats = toolMetricsMap.get(t.href) || { views: 0, users: 0 };
      return {
        id: t.id,
        nameEn: t.nameEn,
        nameAr: t.nameAr,
        href: t.href,
        category: t.category,
        views: stats.views,
        users: stats.users,
        status: t.status,
      };
    });

    return {
      status: "connected",
      data: {
        tools: toolUsage,
        totalTrackedTools: allTools.length,
      },
      error: null,
    };
  } catch (err) {
    return {
      status: "error",
      reason: "query_failed",
      error: err.message || "Failed to query tool telemetry.",
      data: null,
      registeredToolsCount: allTools.length,
    };
  }
}

/**
 * Funnel stages definition:
 * Stage 1: Landing Page or Directory (/ or category page)
 * Stage 2: Calculator Page Visit (e.g. /saudi-gratuity, /uae-vat)
 * Stage 3: Calculation Executed (anonymous client event)
 * Stage 4: Result Exported (PDF export / print / copy)
 */
export async function getFunnelAnalytics(range = "7d") {
  const config = getGa4Config();

  if (!config.isConfigured) {
    return {
      status: "disconnected",
      reason: "telemetry_not_configured",
      error: "Verified journey telemetry is not configured. Synthetic metrics are not displayed.",
      data: null,
    };
  }

  // When GA4 is connected, retrieve verified aggregate stage counts
  const auth = await getGoogleServiceAccountAccessToken({
    clientEmail: config.clientEmail,
    privateKey: config.privateKey,
    scopes: GA4_SCOPE,
  });

  if (!auth.ok) {
    return {
      status: "error",
      reason: auth.error,
      error: "Authentication to GA4 Data API failed.",
      data: null,
    };
  }

  const endpoint = `https://analyticsdata.googleapis.com/v1beta/properties/${config.propertyId}:runReport`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${auth.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        dateRanges: [{ startDate: range === "30d" ? "30daysAgo" : "7daysAgo", endDate: "today" }],
        dimensions: [{ name: "eventName" }],
        metrics: [{ name: "eventCount" }],
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`Funnel event query error: HTTP ${res.status}`);
    }

    const payload = await res.json();
    const eventCounts = new Map();
    (payload.rows || []).forEach((r) => {
      eventCounts.set(r.dimensionValues?.[0]?.value, parseInt(r.metricValues?.[0]?.value || "0", 10));
    });

    const pageViews = eventCounts.get("page_view") || 0;
    const calculateEvents = eventCounts.get("calculator_calculate") || 0;
    const exportEvents = eventCounts.get("calculator_export") || 0;

    return {
      status: "connected",
      data: {
        stages: [
          { name: "Platform Visit", count: pageViews, conversionPct: 100 },
          {
            name: "Calculator Use",
            count: calculateEvents,
            conversionPct: pageViews > 0 ? Number(((calculateEvents / pageViews) * 100).toFixed(1)) : 0,
          },
          {
            name: "Export / Print Result",
            count: exportEvents,
            conversionPct: calculateEvents > 0 ? Number(((exportEvents / calculateEvents) * 100).toFixed(1)) : 0,
          },
        ],
      },
      error: null,
    };
  } catch (err) {
    return {
      status: "error",
      reason: "query_failed",
      error: err.message || "Failed to query funnel events.",
      data: null,
    };
  }
}
