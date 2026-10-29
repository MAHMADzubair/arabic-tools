/**
 * lib/integrations/ga4.js
 *
 * Secure server-side adapter for Google Analytics 4 (Data API v1beta & Realtime API).
 * Never exposes credentials to client. Returns honest typed statuses.
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

function parseDateRange(range) {
  switch (range) {
    case "24h":
    case "today":
      return { startDate: "1daysAgo", endDate: "today" };
    case "30d":
      return { startDate: "30daysAgo", endDate: "today" };
    case "90d":
      return { startDate: "90daysAgo", endDate: "today" };
    case "7d":
    default:
      return { startDate: "7daysAgo", endDate: "today" };
  }
}

/**
 * Runs a query against the GA4 Data API v1beta.
 */
async function runGa4Report(endpoint, body, token, timeoutMs = 8000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

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
}

/**
 * Fetches verified audience & visitor analytics for QEMLO from GA4.
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

  const { startDate, endDate } = parseDateRange(range);
  const baseEndpoint = `https://analyticsdata.googleapis.com/v1beta/properties/${config.propertyId}:runReport`;

  try {
    // 1. Overview KPIs & Daily Trends
    const overviewPromise = runGa4Report(
      baseEndpoint,
      {
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: "date" }],
        metrics: [
          { name: "activeUsers" },
          { name: "sessions" },
          { name: "screenPageViews" },
          { name: "bounceRate" },
          { name: "averageSessionDuration" },
        ],
        orderBys: [{ dimension: { dimensionName: "date", orderType: "ALPHANUMERIC" } }],
      },
      auth.token
    );

    // 2. Country Breakdown
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

    // 3. Device Category Breakdown
    const devicesPromise = runGa4Report(
      baseEndpoint,
      {
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: "deviceCategory" }],
        metrics: [{ name: "activeUsers" }],
      },
      auth.token
    );

    // 4. Top Visited Pages
    const pagesPromise = runGa4Report(
      baseEndpoint,
      {
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: "pagePath" }],
        metrics: [{ name: "screenPageViews" }, { name: "activeUsers" }],
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        limit: 10,
      },
      auth.token
    );

    const [overviewData, countriesData, devicesData, pagesData] = await Promise.all([
      overviewPromise,
      countriesPromise,
      devicesPromise,
      pagesPromise,
    ]);

    // Aggregate totals from daily rows
    let totalActiveUsers = 0;
    let totalSessions = 0;
    let totalViews = 0;
    let weightedBounceRate = 0;
    let totalDuration = 0;

    const dailyTrends = (overviewData.rows || []).map((row) => {
      const d = row.dimensionValues?.[0]?.value || "";
      const formattedDate =
        d.length === 8 ? `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}` : d;
      const users = parseInt(row.metricValues?.[0]?.value || "0", 10);
      const sess = parseInt(row.metricValues?.[1]?.value || "0", 10);
      const views = parseInt(row.metricValues?.[2]?.value || "0", 10);
      const bounce = parseFloat(row.metricValues?.[3]?.value || "0");
      const duration = parseFloat(row.metricValues?.[4]?.value || "0");

      totalActiveUsers += users;
      totalSessions += sess;
      totalViews += views;
      weightedBounceRate += bounce * (sess || 1);
      totalDuration += duration * (sess || 1);

      return {
        date: formattedDate,
        label: formattedDate.slice(5),
        value: users,
        sessions: sess,
        views,
      };
    });

    const count = totalSessions || 1;
    const avgBounceRate = (weightedBounceRate / count) * 100;
    const avgDurationSec = Math.round(totalDuration / count);

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
      views: parseInt(row.metricValues?.[0]?.value || "0", 10),
      users: parseInt(row.metricValues?.[1]?.value || "0", 10),
    }));

    if (dailyTrends.length === 0 && countries.length === 0) {
      return {
        status: "no_data",
        data: {
          kpis: { activeUsers: 0, sessions: 0, views: 0, bounceRatePct: 0, avgDurationSec: 0 },
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
        kpis: {
          activeUsers: totalActiveUsers,
          sessions: totalSessions,
          views: totalViews,
          bounceRatePct: Number(avgBounceRate.toFixed(1)),
          avgDurationSec,
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
    const rawData = await runGa4Report(
      realtimeEndpoint,
      {
        dimensions: [{ name: "unifiedScreenName" }, { name: "country" }],
        metrics: [{ name: "activeUsers" }],
        limit: 20,
      },
      auth.token
    );

    let activeUsers = 0;
    const pageMap = new Map();
    const countryMap = new Map();

    (rawData.rows || []).forEach((row) => {
      const page = row.dimensionValues?.[0]?.value || "Unknown";
      const country = row.dimensionValues?.[1]?.value || "Unknown";
      const users = parseInt(row.metricValues?.[0]?.value || "0", 10);

      activeUsers += users;
      pageMap.set(page, (pageMap.get(page) || 0) + users);
      countryMap.set(country, (countryMap.get(country) || 0) + users);
    });

    const topPages = Array.from(pageMap.entries())
      .map(([page, users]) => ({ page, users }))
      .sort((a, b) => b.users - a.users);

    const countries = Array.from(countryMap.entries())
      .map(([country, users]) => ({ label: country, value: users }))
      .sort((a, b) => b.value - a.value);

    return {
      status: "connected",
      data: {
        activeUsers,
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
