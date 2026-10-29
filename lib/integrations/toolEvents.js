/**
 * lib/integrations/toolEvents.js
 *
 * Privacy-preserving aggregate tool telemetry & event metrics adapter.
 * Strictly anonymous: NEVER stores or accepts salary inputs, gratuity amounts,
 * personal identifiers, or calculation parameters.
 *
 * Clearly distinguishes independent aggregate event volumes from sequential funnels.
 * Missing calculation or export events are reported as uninstrumented, not verified zero conversions.
 */

import { getGa4Config } from "./ga4.js";
import { getGoogleServiceAccountAccessToken } from "./googleAuth.js";
import { getActiveTools } from "../registry.js";

const GA4_SCOPE = "https://www.googleapis.com/auth/analytics.readonly";

export async function getToolUsageReport(range = "7d") {
  const config = getGa4Config();
  const allTools = getActiveTools();

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
 * Returns verified independent event volumes and instrumentation statuses.
 * Raw event counts are explicitly labeled as independent standalone volumes,
 * NOT sequential user conversions.
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
        metrics: [{ name: "eventCount" }, { name: "totalUsers" }],
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`Funnel event query error: HTTP ${res.status}`);
    }

    const payload = await res.json();
    const eventCounts = new Map();
    const userCounts = new Map();

    (payload.rows || []).forEach((r) => {
      const name = r.dimensionValues?.[0]?.value;
      const count = parseInt(r.metricValues?.[0]?.value || "0", 10);
      const users = parseInt(r.metricValues?.[1]?.value || "0", 10);
      eventCounts.set(name, count);
      userCounts.set(name, users);
    });

    const pageViews = eventCounts.get("page_view");
    const uniqueViewers = userCounts.get("page_view");
    const hasCalculateEvent = eventCounts.has("calculator_calculate");
    const calculateEvents = eventCounts.get("calculator_calculate");
    const hasExportEvent = eventCounts.has("calculator_export");
    const exportEvents = eventCounts.get("calculator_export");

    const events = [
      {
        name: "Platform Page Views",
        description: "Total page navigation views recorded across all tools",
        type: "Standard Event (page_view)",
        count: pageViews ?? 0,
        users: uniqueViewers ?? 0,
        status: pageViews !== undefined ? "active" : "no_data",
      },
      {
        name: "Anonymous Calculations Triggered",
        description: "Client-side calculation execution events",
        type: "Custom Event (calculator_calculate)",
        count: hasCalculateEvent ? calculateEvents : null,
        status: hasCalculateEvent ? "active" : "telemetry_pending_setup",
        note: hasCalculateEvent
          ? "Independent event count"
          : "Custom event not yet received; telemetry pending setup (not a verified zero)",
      },
      {
        name: "Calculation Exports / Prints",
        description: "PDF export, print, or copy events triggered by visitors",
        type: "Custom Event (calculator_export)",
        count: hasExportEvent ? exportEvents : null,
        status: hasExportEvent ? "active" : "telemetry_pending_setup",
        note: hasExportEvent
          ? "Independent event count"
          : "Custom event not yet received; telemetry pending setup (not a verified zero)",
      },
    ];

    return {
      status: "connected",
      data: {
        events,
        isSequentialFunnel: false,
        methodology: "Independent Aggregate Event Volumes",
      },
      error: null,
    };
  } catch (err) {
    return {
      status: "error",
      reason: "query_failed",
      error: err.message || "Failed to query event telemetry.",
      data: null,
    };
  }
}
