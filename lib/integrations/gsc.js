/**
 * lib/integrations/gsc.js
 *
 * Secure server-side adapter for Google Search Console (Search Analytics API v3).
 * Never reports indexing status from search analytics alone.
 * Never displays fabricated or mock queries.
 */

import { getGoogleServiceAccountAccessToken } from "./googleAuth.js";
import { sanitizeEnvVar } from "../adminMfa.js";
import { SITE_URL } from "../siteConfig.js";

const GSC_SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";

export function getGscConfig() {
  const clientEmail = sanitizeEnvVar(process.env.GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL);
  const privateKey = sanitizeEnvVar(process.env.GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY);
  const siteUrl = sanitizeEnvVar(process.env.GSC_SITE_URL) || `${SITE_URL}/`;

  return {
    clientEmail,
    privateKey,
    siteUrl,
    isConfigured: Boolean(clientEmail && privateKey),
  };
}

function getGscDateRange(range = "28d") {
  const end = new Date();
  // GSC data usually has a 2-3 day latency
  end.setDate(end.getDate() - 2);

  const start = new Date(end);
  switch (range) {
    case "7d":
      start.setDate(start.getDate() - 7);
      break;
    case "90d":
      start.setDate(start.getDate() - 90);
      break;
    case "28d":
    default:
      start.setDate(start.getDate() - 28);
      break;
  }

  const fmt = (d) => d.toISOString().slice(0, 10);
  return { startDate: fmt(start), endDate: fmt(end) };
}

/**
 * Runs a query against the GSC searchAnalytics/query API.
 */
async function queryGsc(siteUrl, body, token, timeoutMs = 8000) {
  const encodedSite = encodeURIComponent(siteUrl);
  const endpoint = `https://www.googleapis.com/webmasters/v3/sites/${encodedSite}/searchAnalytics/query`;

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
    throw new Error(`Google Search Console API error: HTTP ${res.status}`);
  }

  return await res.json();
}

/**
 * Fetches verified Search Console performance metrics for QEMLO.
 */
export async function getGscSearchPerformance(range = "28d") {
  const config = getGscConfig();
  if (!config.isConfigured) {
    return {
      status: "disconnected",
      reason: "missing_credentials",
      error: "Google Search Console Service Account credentials are not configured.",
      data: null,
    };
  }

  const auth = await getGoogleServiceAccountAccessToken({
    clientEmail: config.clientEmail,
    privateKey: config.privateKey,
    scopes: GSC_SCOPE,
  });

  if (!auth.ok) {
    return {
      status: "error",
      reason: auth.error,
      error: "Authentication to Google Search Console API failed.",
      data: null,
    };
  }

  const { startDate, endDate } = getGscDateRange(range);

  try {
    // 1. Overall Aggregate
    const aggregatePromise = queryGsc(
      config.siteUrl,
      {
        startDate,
        endDate,
        aggregationType: "auto",
      },
      auth.token
    );

    // 2. Daily Trends
    const trendsPromise = queryGsc(
      config.siteUrl,
      {
        startDate,
        endDate,
        dimensions: ["date"],
      },
      auth.token
    );

    // 3. Top Queries
    const queriesPromise = queryGsc(
      config.siteUrl,
      {
        startDate,
        endDate,
        dimensions: ["query"],
        rowLimit: 15,
      },
      auth.token
    );

    // 4. Top Indexed Pages
    const pagesPromise = queryGsc(
      config.siteUrl,
      {
        startDate,
        endDate,
        dimensions: ["page"],
        rowLimit: 15,
      },
      auth.token
    );

    const [aggData, trendsData, queriesData, pagesData] = await Promise.all([
      aggregatePromise,
      trendsPromise,
      queriesPromise,
      pagesPromise,
    ]);

    const aggRow = aggData.rows?.[0] || {};
    const totalClicks = Math.round(aggRow.clicks || 0);
    const totalImpressions = Math.round(aggRow.impressions || 0);
    const avgCtr = aggRow.ctr ? Number((aggRow.ctr * 100).toFixed(2)) : 0;
    const avgPosition = aggRow.position ? Number(aggRow.position.toFixed(1)) : 0;

    const dailyTrends = (trendsData.rows || []).map((row) => ({
      date: row.keys?.[0] || "",
      label: (row.keys?.[0] || "").slice(5),
      value: Math.round(row.clicks || 0),
      impressions: Math.round(row.impressions || 0),
      ctr: row.ctr ? Number((row.ctr * 100).toFixed(1)) : 0,
      position: row.position ? Number(row.position.toFixed(1)) : 0,
    }));

    const topQueries = (queriesData.rows || []).map((row) => ({
      query: row.keys?.[0] || "",
      clicks: Math.round(row.clicks || 0),
      impressions: Math.round(row.impressions || 0),
      ctr: row.ctr ? Number((row.ctr * 100).toFixed(1)) : 0,
      position: row.position ? Number(row.position.toFixed(1)) : 0,
    }));

    const topPages = (pagesData.rows || []).map((row) => ({
      page: row.keys?.[0] || "",
      clicks: Math.round(row.clicks || 0),
      impressions: Math.round(row.impressions || 0),
      ctr: row.ctr ? Number((row.ctr * 100).toFixed(1)) : 0,
      position: row.position ? Number(row.position.toFixed(1)) : 0,
    }));

    if (totalClicks === 0 && totalImpressions === 0 && topQueries.length === 0) {
      return {
        status: "no_data",
        data: {
          kpis: { clicks: 0, impressions: 0, ctr: 0, position: 0 },
          dailyTrends: [],
          topQueries: [],
          topPages: [],
          dateRange: { startDate, endDate },
        },
        error: null,
      };
    }

    return {
      status: "connected",
      data: {
        kpis: {
          clicks: totalClicks,
          impressions: totalImpressions,
          ctr: avgCtr,
          position: avgPosition,
        },
        dailyTrends,
        topQueries,
        topPages,
        dateRange: { startDate, endDate },
      },
      error: null,
    };
  } catch (err) {
    return {
      status: "error",
      reason: "query_failed",
      error: err.message || "Failed to query Google Search Console API.",
      data: null,
    };
  }
}

