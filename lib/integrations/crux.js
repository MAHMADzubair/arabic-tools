/**
 * lib/integrations/crux.js
 *
 * Secure server-side adapter for Google Chrome User Experience Report (CrUX) API.
 * Provides verified Core Web Vitals field measurements for https://qemlo.com.
 * Never displays estimated or synthetic field numbers.
 */

import { sanitizeEnvVar } from "../adminMfa.js";
import { SITE_URL } from "../siteConfig.js";

export function getCruxConfig() {
  const apiKey = sanitizeEnvVar(process.env.GOOGLE_CRUX_API_KEY || process.env.GOOGLE_API_KEY);
  const origin = sanitizeEnvVar(process.env.NEXT_PUBLIC_SITE_URL) || SITE_URL;

  return {
    apiKey,
    origin,
    isConfigured: Boolean(apiKey),
  };
}

function evaluateMetric(name, p75) {
  if (typeof p75 !== "number") return { rating: "unknown", label: "No Data" };

  switch (name) {
    case "largest_contentful_paint":
      if (p75 <= 2500) return { rating: "good", label: "Good" };
      if (p75 <= 4000) return { rating: "needs_improvement", label: "Needs Improvement" };
      return { rating: "poor", label: "Poor" };

    case "interaction_to_next_paint":
      if (p75 <= 200) return { rating: "good", label: "Good" };
      if (p75 <= 500) return { rating: "needs_improvement", label: "Needs Improvement" };
      return { rating: "poor", label: "Poor" };

    case "cumulative_layout_shift":
      if (p75 <= 0.1) return { rating: "good", label: "Good" };
      if (p75 <= 0.25) return { rating: "needs_improvement", label: "Needs Improvement" };
      return { rating: "poor", label: "Poor" };

    case "first_contentful_paint":
      if (p75 <= 1800) return { rating: "good", label: "Good" };
      if (p75 <= 3000) return { rating: "needs_improvement", label: "Needs Improvement" };
      return { rating: "poor", label: "Poor" };

    case "experimental_time_to_first_byte":
      if (p75 <= 800) return { rating: "good", label: "Good" };
      if (p75 <= 1800) return { rating: "needs_improvement", label: "Needs Improvement" };
      return { rating: "poor", label: "Poor" };

    default:
      return { rating: "neutral", label: "Recorded" };
  }
}

/**
 * Fetches real-user Core Web Vitals field measurements from CrUX API.
 */
export async function getCruxPerformanceMetrics() {
  const config = getCruxConfig();
  if (!config.isConfigured) {
    return {
      status: "disconnected",
      reason: "missing_credentials",
      error: "Google CrUX API key is not configured.",
      data: null,
    };
  }

  const endpoint = `https://chromeuxreport.googleapis.com/v1/records:queryRecord?key=${encodeURIComponent(
    config.apiKey
  )}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        origin: config.origin,
        formFactor: "ALL",
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.status === 404) {
      return {
        status: "no_data",
        reason: "origin_not_in_crux",
        error: "Origin does not have sufficient public traffic for Chrome UX field reporting.",
        data: null,
      };
    }

    if (!res.ok) {
      throw new Error(`CrUX API error: HTTP ${res.status}`);
    }

    const payload = await res.json();
    const metrics = payload.record?.metrics || {};

    const extractMetric = (key) => {
      const metric = metrics[key];
      if (!metric) return null;
      const p75 = metric.percentiles?.p75;
      const numP75 = typeof p75 === "string" ? parseFloat(p75) : p75;
      const evalResult = evaluateMetric(key, numP75);

      return {
        p75: numP75,
        rating: evalResult.rating,
        label: evalResult.label,
        histogram: (metric.histogram || []).map((h) => ({
          start: h.start,
          end: h.end,
          density: Number((h.density * 100).toFixed(1)),
        })),
      };
    };

    return {
      status: "connected",
      data: {
        origin: config.origin,
        collectionPeriod: payload.record?.collectionPeriod,
        lcp: extractMetric("largest_contentful_paint"),
        inp: extractMetric("interaction_to_next_paint"),
        cls: extractMetric("cumulative_layout_shift"),
        fcp: extractMetric("first_contentful_paint"),
        ttfb: extractMetric("experimental_time_to_first_byte"),
      },
      error: null,
    };
  } catch (err) {
    return {
      status: "error",
      reason: "query_failed",
      error: err.message || "Failed to query CrUX API.",
      data: null,
    };
  }
}
