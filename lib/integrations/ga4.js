/**
 * lib/integrations/ga4.js
 *
 * Secure server-side adapter for Google Analytics 4 (Data API v1beta & Realtime API).
 * Never exposes credentials to client. Returns honest typed statuses.
 * Correctly requests distinct period-level aggregate metrics rather than summing daily unique users.
 */

import { getGoogleServiceAccountAccessToken } from "./googleAuth.js";
import { sanitizeEnvVar } from "../adminMfa.js";

const GA4_SCOPE = "https://www.googleapis.com/auth/analytics.readonly";

export function getGa4Config() {
  const propertyId = sanitizeEnvVar(process.env.GA4_PROPERTY_ID);
  const clientEmail = sanitizeEnvVar(
    process.env.GOOGLE_ANALYTICS_CLIENT_EMAIL || process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL
  );
  const privateKey = sanitizeEnvVar(
    process.env.GOOGLE_ANALYTICS_PRIVATE_KEY || process.env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY
  );

  return {
    propertyId,
    clientEmail,
    privateKey,
    isConfigured: Boolean(propertyId && clientEmail && privateKey),
  };
}

export function parseDateRange(range) {
  switch (range) {
    case "24h":
    case "today":
      return {
        startDate: "yesterday",
        endDate: "today",
        periodLabel: "Yesterday & Today (Past 24-48h)",
        shortLabel: "24-48h",
      };
    case "30d":
      return {
        startDate: "30daysAgo",
        endDate: "today",
        periodLabel: "Past 30 Days",
        shortLabel: "30d",
      };
    case "90d":
      return {
        startDate: "90daysAgo",
        endDate: "today",
        periodLabel: "Past 90 Days",
        shortLabel: "90d",
      };
    case "7d":
    default:
      return {
        startDate: "7daysAgo",
        endDate: "today",
        periodLabel: "Past 7 Days",
        shortLabel: "7d",
      };
  }
}

/**
 * Runs a query against the GA4 Data API v1beta with timeout and sanitization.
 */
export async function runGa4Report(endpoint, body, token, timeoutMs = 8000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`GA4 API request returned HTTP ${res.status}`);
    }

    return await res.json();
  } catch (err) {
    clearTimeout(timeout);
    if (err.name === "AbortError") {
      throw new Error("GA4 API request timed out.");
    }
    throw err;
  }
}

/**
 * Fetches verified audience & visitor analytics for QEMLO from GA4.
 * Requests period-level aggregate metrics directly rather than summing daily unique users.
 */
export async function getGa4VisitorsReport(range = "7d") {
  const config = getGa4Config();
  if (!config.isConfigured) {
    return {
      status: "disconnected",
      reason: "missing_credentials",
      error: "GA4 Property ID and Service Account credentials are not configured.",
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
      error: "Authentication to Google Analytics failed.",
      data: null,
    };
  }

  const { startDate, endDate, periodLabel, shortLabel } = parseDateRange(range);
  const baseEndpoint = `https://analyticsdata.googleapis.com/v1beta/properties/${config.propertyId}:runReport`;

  try {
    // 1. Period-level aggregate KPIs (NO dimensions -> exact period deduplication by GA4)
    const aggregatePromise = runGa4Report(
      baseEndpoint,
      {
        dateRanges: [{ startDate, endDate }],
        metrics: [
          { name: "activeUsers" },
          { name: "sessions" },
          { name: "screenPageViews" },
          { name: "bounceRate" },
          { name: "averageSessionDuration" },
        ],
      },
      auth.token
    );

    // 2. Daily Trends breakdown (for trend charts only)
    const dailyTrendsPromise = runGa4Report(
      baseEndpoint,
      {
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: "date" }],
        metrics: [
          { name: "activeUsers" },
          { name: "sessions" },
          { name: "screenPageViews" },
        ],
        orderBys: [{ dimension: { dimensionName: "date", orderType: "ALPHANUMERIC" } }],
      },
      auth.token
    );

    // 3. Country Breakdown
    const countriesPromise = runGa4Report(
      baseEndpoint,
      {
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: "country" }],
        metrics: [{ name: "activeUsers" }],
        orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
        limit: 10,
      },
      auth.token
    );

    // 4. Device Category Breakdown
    const devicesPromise = runGa4Report(
      baseEndpoint,
      {
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: "deviceCategory" }],
        metrics: [{ name: "activeUsers" }],
      },
      auth.token
    );

    // 5. Top Visited Pages
    const pagesPromise = runGa4Report(
      baseEndpoint,
      {
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: "pagePath" }, { name: "pageTitle" }],
        metrics: [{ name: "screenPageViews" }, { name: "activeUsers" }],
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        limit: 15,
      },
      auth.token
    );

    const [aggregateData, dailyTrendsData, countriesData, devicesData, pagesData] =
      await Promise.all([
        aggregatePromise,
        dailyTrendsPromise,
        countriesPromise,
        devicesPromise,
        pagesPromise,
      ]);

    // Parse verified period-level deduplicated aggregate metrics
    const aggRow = aggregateData.rows?.[0]?.metricValues || [];
    const periodActiveUsers = parseInt(aggRow[0]?.value || "0", 10);
    const periodSessions = parseInt(aggRow[1]?.value || "0", 10);
    const periodViews = parseInt(aggRow[2]?.value || "0", 10);
    const periodBounceRate = parseFloat(aggRow[3]?.value || "0");
    const periodDuration = parseFloat(aggRow[4]?.value || "0");

    const dailyTrends = (dailyTrendsData.rows || []).map((row) => {
      const d = row.dimensionValues?.[0]?.value || "";
      const formattedDate =
        d.length === 8 ? `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}` : d;
      const users = parseInt(row.metricValues?.[0]?.value || "0", 10);
      const sess = parseInt(row.metricValues?.[1]?.value || "0", 10);
      const views = parseInt(row.metricValues?.[2]?.value || "0", 10);

      return {
        date: formattedDate,
        label: formattedDate.slice(5),
        value: users,
        sessions: sess,
        views,
      };
    });

    const countries = (countriesData.rows || []).map((row) => ({
      label: row.dimensionValues?.[0]?.value || "Unknown",
      value: parseInt(row.metricValues?.[0]?.value || "0", 10),
    }));

    const devices = (devicesData.rows || []).map((row) => ({
      label: row.dimensionValues?.[0]?.value || "Unknown",
      value: parseInt(row.metricValues?.[0]?.value || "0", 10),
    }));

    const topPages = (pagesData.rows || []).map((row) => ({
      path: row.dimensionValues?.[0]?.value || "/",
      title: row.dimensionValues?.[1]?.value || "Untitled",
      views: parseInt(row.metricValues?.[0]?.value || "0", 10),
      users: parseInt(row.metricValues?.[1]?.value || "0", 10),
    }));

    if (periodActiveUsers === 0 && periodSessions === 0 && dailyTrends.length === 0) {
      return {
        status: "no_data",
        data: {
          periodLabel,
          shortLabel,
          kpis: {
            activeUsers: 0,
            sessions: 0,
            views: 0,
            bounceRatePct: 0,
            avgDurationSec: 0,
          },
          dailyTrends: [],
          countries: [],
          devices: [],
          topPages: [],
        },
        error: null,
      };
    }

    return {
      status: "connected",
      data: {
        periodLabel,
        shortLabel,
        kpis: {
          activeUsers: periodActiveUsers,
          sessions: periodSessions,
          views: periodViews,
          bounceRatePct: Number((periodBounceRate * 100).toFixed(1)),
          avgDurationSec: Math.round(periodDuration),
        },
        dailyTrends,
        countries,
        devices,
        topPages,
      },
      error: null,
    };
  } catch (err) {
    return {
      status: "error",
      reason: "query_failed",
      error: err.message || "Failed to retrieve GA4 reports.",
      data: null,
    };
  }
}

/**
 * Fetches verified realtime visitor count and active pages from GA4 Realtime API.
 * Fetches the complete independent overall active users metric without summing grouped rows.
 * Distinguishes page titles from page paths.
 */
export async function getGa4RealtimeReport() {
  const config = getGa4Config();
  if (!config.isConfigured) {
    return {
      status: "disconnected",
      reason: "missing_credentials",
      error: "GA4 Property ID and Service Account credentials are not configured.",
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
      error: "Authentication to Google Analytics Realtime API failed.",
      data: null,
    };
  }

  const realtimeEndpoint = `https://analyticsdata.googleapis.com/v1beta/properties/${config.propertyId}:runRealtimeReport`;

  try {
    // 1. Complete independent overall active users metric (NO dimensions -> property-wide distinct count)
    const overallPromise = runGa4Report(
      realtimeEndpoint,
      {
        metrics: [{ name: "activeUsers" }],
      },
      auth.token
    );

    // 2. Active pages breakdown (distinguishing pagePath from unifiedScreenName / page title)
    const pagesPromise = runGa4Report(
      realtimeEndpoint,
      {
        dimensions: [{ name: "pagePath" }, { name: "unifiedScreenName" }],
        metrics: [{ name: "activeUsers" }],
        orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
        limit: 25,
      },
      auth.token
    );

    // 3. Active countries breakdown
    const countriesPromise = runGa4Report(
      realtimeEndpoint,
      {
        dimensions: [{ name: "country" }],
        metrics: [{ name: "activeUsers" }],
        orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
        limit: 10,
      },
      auth.token
    );

    const [overallData, pagesData, countriesData] = await Promise.all([
      overallPromise,
      pagesPromise,
      countriesPromise,
    ]);

    const distinctActiveUsers = parseInt(
      overallData.rows?.[0]?.metricValues?.[0]?.value || "0",
      10
    );

    const topPages = (pagesData.rows || []).map((row) => ({
      path: row.dimensionValues?.[0]?.value || "/",
      title: row.dimensionValues?.[1]?.value || "Calculator",
      users: parseInt(row.metricValues?.[0]?.value || "0", 10),
    }));

    const countries = (countriesData.rows || []).map((row) => ({
      label: row.dimensionValues?.[0]?.value || "Unknown",
      value: parseInt(row.metricValues?.[0]?.value || "0", 10),
    }));

    return {
      status: "connected",
      data: {
        activeUsers: distinctActiveUsers,
        topPages,
        countries,
        timestamp: new Date().toISOString(),
      },
      error: null,
    };
  } catch (err) {
    return {
      status: "error",
      reason: "realtime_query_failed",
      error: err.message || "Failed to query GA4 realtime endpoint.",
      data: null,
    };
  }
}
