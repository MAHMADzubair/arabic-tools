/**
 * lib/integrations/adsense.js
 *
 * Secure server-side adapter for Google AdSense Management API (v2).
 * Strictly requires authorized OAuth2 credentials to display earnings or RPM.
 * Dynamically parses currency metadata from the API response instead of assuming USD.
 * Never displays estimated or synthetic revenue numbers.
 */

import { getGoogleOAuthAccessToken } from "./googleAuth.js";
import { sanitizeEnvVar } from "../adminMfa.js";

export function getAdSenseConfig() {
  const clientId = sanitizeEnvVar(process.env.ADSENSE_CLIENT_ID);
  const clientSecret = sanitizeEnvVar(process.env.ADSENSE_CLIENT_SECRET);
  const refreshToken = sanitizeEnvVar(process.env.ADSENSE_REFRESH_TOKEN);
  const pubId = sanitizeEnvVar(process.env.NEXT_PUBLIC_ADSENSE_PUB_ID) || "ca-pub-4706954030329423";
  const accountId =
    sanitizeEnvVar(process.env.ADSENSE_ACCOUNT_ID) ||
    (pubId.startsWith("ca-") ? pubId.replace("ca-", "") : pubId);

  return {
    clientId,
    clientSecret,
    refreshToken,
    pubId,
    accountId,
    isConfigured: Boolean(clientId && clientSecret && refreshToken),
  };
}

export function formatAdSenseCurrency(amount, currency = "USD") {
  if (typeof amount !== "number" || isNaN(amount)) return "—";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

/**
 * Fetches verified AdSense monetization metrics for QEMLO with dynamic currency parsing.
 */
export async function getAdSenseRevenueReport(range = "30d") {
  const config = getAdSenseConfig();
  if (!config.isConfigured) {
    return {
      status: "disconnected",
      reason: "missing_credentials",
      error: "AdSense OAuth2 client credentials or refresh token are not configured.",
      data: null,
    };
  }

  const auth = await getGoogleOAuthAccessToken({
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    refreshToken: config.refreshToken,
  });

  if (!auth.ok) {
    return {
      status: "error",
      reason: auth.error,
      error: "Authentication to Google AdSense Management API failed.",
      data: null,
    };
  }

  const endpoint = new URL(
    `https://adsense.googleapis.com/v2/accounts/${encodeURIComponent(config.accountId)}/reports:generate`
  );

  const dateRangeParam = range === "7d" ? "LAST_7_DAYS" : "LAST_30_DAYS";
  endpoint.searchParams.set("dateRange", dateRangeParam);
  endpoint.searchParams.append("metrics", "ESTIMATED_EARNINGS");
  endpoint.searchParams.append("metrics", "PAGE_VIEWS");
  endpoint.searchParams.append("metrics", "IMPRESSIONS");
  endpoint.searchParams.append("metrics", "PAGE_VIEWS_RPM");
  endpoint.searchParams.append("dimensions", "DATE");

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(endpoint.toString(), {
      headers: {
        Authorization: `Bearer ${auth.token}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`AdSense API error: HTTP ${res.status}`);
    }

    const report = await res.json();
    const rows = report.rows || [];

    // Dynamically parse currency code from header metadata
    const currencyHeader = (report.headers || []).find(
      (h) => h.currencyCode || h.name === "ESTIMATED_EARNINGS"
    );
    const currencyCode = (
      currencyHeader?.currencyCode ||
      report.currencyCode ||
      "USD"
    ).toUpperCase();

    let totalEarnings = 0;
    let totalPageViews = 0;
    let totalImpressions = 0;

    const dailyTrends = rows.map((row) => {
      const d = row.cells?.[0]?.value || "";
      const earnings = parseFloat(row.cells?.[1]?.value || "0");
      const views = parseInt(row.cells?.[2]?.value || "0", 10);
      const impressions = parseInt(row.cells?.[3]?.value || "0", 10);
      const rpm = parseFloat(row.cells?.[4]?.value || "0");

      totalEarnings += earnings;
      totalPageViews += views;
      totalImpressions += impressions;

      return {
        date: d,
        label: d.slice(5),
        value: Number(earnings.toFixed(2)),
        views,
        impressions,
        rpm,
      };
    });

    const avgRpm = totalPageViews > 0 ? (totalEarnings / totalPageViews) * 1000 : 0;

    return {
      status: "connected",
      data: {
        kpis: {
          estimatedEarnings: Number(totalEarnings.toFixed(2)),
          pageViews: totalPageViews,
          impressions: totalImpressions,
          pageRpm: Number(avgRpm.toFixed(2)),
        },
        dailyTrends,
        currency: currencyCode,
      },
      error: null,
    };
  } catch (err) {
    return {
      status: "error",
      reason: "query_failed",
      error: err.message || "Failed to retrieve AdSense revenue report.",
      data: null,
    };
  }
}
