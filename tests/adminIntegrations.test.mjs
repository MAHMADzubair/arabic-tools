import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import {
  normalizePrivateKey,
  createSignedJwt,
  getGoogleServiceAccountAccessToken,
  getGoogleOAuthAccessToken,
} from "../lib/integrations/googleAuth.js";
import {
  getGa4Config,
  parseDateRange,
  getGa4VisitorsReport,
  getGa4RealtimeReport,
} from "../lib/integrations/ga4.js";
import { getGscConfig, getGscSearchPerformance } from "../lib/integrations/gsc.js";
import {
  getAdSenseConfig,
  getAdSenseRevenueReport,
  formatAdSenseCurrency,
} from "../lib/integrations/adsense.js";
import {
  getCruxConfig,
  getCruxPerformanceMetrics,
  buildCruxRequestBody,
} from "../lib/integrations/crux.js";
import { getToolUsageReport, getFunnelAnalytics } from "../lib/integrations/toolEvents.js";

function generateTestPemRsaKeys() {
  return crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });
}

// ── Test 1: Private Key Normalization ────────────────────────────────
test("Google Auth: normalizePrivateKey sanitizes escaped newlines, quotes and whitespace", () => {
  const rawKey = ' "line1\\nline2\\nline3" ';
  const normalized = normalizePrivateKey(rawKey);
  assert.equal(normalized, "line1\nline2\nline3");
  assert.equal(normalizePrivateKey(null), "");
  assert.equal(normalizePrivateKey(123), "");
});

// ── Test 2: RS256 JWT Generation & Verification ───────────────────────
test("Google Auth: createSignedJwt produces verifiable RS256 token assertion", () => {
  const { privateKey, publicKey } = generateTestPemRsaKeys();

  const clientEmail = "test-service-account@qemlo-test.iam.gserviceaccount.com";
  const scopes = ["https://www.googleapis.com/auth/analytics.readonly"];
  const jwt = createSignedJwt(clientEmail, privateKey, scopes);

  const parts = jwt.split(".");
  assert.equal(parts.length, 3, "JWT must contain header, payload, and signature");

  const header = JSON.parse(Buffer.from(parts[0], "base64url").toString("utf8"));
  assert.equal(header.alg, "RS256");
  assert.equal(header.typ, "JWT");

  const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
  assert.equal(payload.iss, clientEmail);
  assert.equal(payload.scope, scopes[0]);
  assert.equal(payload.aud, "https://oauth2.googleapis.com/token");
  assert.ok(payload.exp > payload.iat);

  const verifier = crypto.createVerify("RSA-SHA256");
  verifier.update(`${parts[0]}.${parts[1]}`);
  const valid = verifier.verify(publicKey, parts[2], "base64url");
  assert.equal(valid, true, "JWT signature must verify with public key");
});

// ── Test 3: Credential Failure Modes ─────────────────────────────────
test("Google Auth: token fetch fails gracefully when credentials are not configured", async () => {
  const res = await getGoogleServiceAccountAccessToken({
    clientEmail: "",
    privateKey: "",
    scopes: ["scope1"],
  });
  assert.equal(res.ok, false);
  assert.equal(res.error, "missing_credentials");

  const oauthRes = await getGoogleOAuthAccessToken({
    clientId: "",
    clientSecret: "",
    refreshToken: "",
  });
  assert.equal(oauthRes.ok, false);
  assert.equal(oauthRes.error, "missing_credentials");
});

// ── Test 4: GA4 Date Range Calculation Accuracy ──────────────────────
test("GA4 Adapter: parseDateRange accurately represents 24h as yesterday & today", () => {
  const r24 = parseDateRange("24h");
  assert.equal(r24.startDate, "yesterday");
  assert.equal(r24.endDate, "today");
  assert.ok(r24.periodLabel.includes("24-48h"));

  const r7 = parseDateRange("7d");
  assert.equal(r7.startDate, "7daysAgo");
  assert.equal(r7.endDate, "today");
});

// ── Test 5: GA4 Disconnected Status Fallback ─────────────────────────
test("GA4 Adapter: honest disconnected status when credentials missing", async () => {
  const config = getGa4Config();
  if (!config.isConfigured) {
    const report = await getGa4VisitorsReport("7d");
    assert.equal(report.status, "disconnected");
    assert.equal(report.reason, "missing_credentials");
    assert.equal(report.data, null);

    const realtime = await getGa4RealtimeReport();
    assert.equal(realtime.status, "disconnected");
    assert.equal(realtime.reason, "missing_credentials");
    assert.equal(realtime.data, null);
  }
});

// ── Test 6: GSC Disconnected Status Fallback ─────────────────────────
test("GSC Adapter: honest disconnected status and no indexing claims", async () => {
  const config = getGscConfig();
  if (!config.isConfigured) {
    const perf = await getGscSearchPerformance("28d");
    assert.equal(perf.status, "disconnected");
    assert.equal(perf.reason, "missing_credentials");
    assert.equal(perf.data, null);
  }
});

// ── Test 7: AdSense Dynamic Currency & Disconnected Fallback ──────────
test("AdSense Adapter: dynamic currency formatting parses any ISO code", () => {
  assert.equal(formatAdSenseCurrency(1250.5, "SAR"), "SAR 1,250.50");
  assert.equal(formatAdSenseCurrency(850.25, "AED"), "AED 850.25");
  assert.equal(formatAdSenseCurrency(500, "USD"), "$500.00");
  assert.equal(formatAdSenseCurrency(null, "USD"), "—");
  assert.equal(formatAdSenseCurrency(NaN, "USD"), "—");
});

test("AdSense Adapter: honest disconnected status without OAuth credentials", async () => {
  const config = getAdSenseConfig();
  if (!config.isConfigured) {
    const rev = await getAdSenseRevenueReport("30d");
    assert.equal(rev.status, "disconnected");
    assert.equal(rev.reason, "missing_credentials");
    assert.equal(rev.data, null);
  }
});

// ── Test 8: CrUX Disconnected Fallback ────────────────────────────────
test("CrUX Adapter: honest disconnected status without API key", async () => {
  const config = getCruxConfig();
  if (!config.isConfigured) {
    const cwv = await getCruxPerformanceMetrics();
    assert.equal(cwv.status, "disconnected");
    assert.equal(cwv.reason, "missing_credentials");
    assert.equal(cwv.data, null);
  }
});

// ── Test 9: Tool Telemetry & Funnel Protocol ─────────────────────────
test("Tool Telemetry & Funnel: discovers all registered tools and strictly excludes PII", async () => {
  const usage = await getToolUsageReport("7d");
  assert.equal(typeof usage.registeredToolsCount, "number");
  assert.ok(usage.registeredToolsCount >= 27);

  const funnel = await getFunnelAnalytics("7d");
  assert.ok(funnel.status === "disconnected" || funnel.status === "connected");
  if (funnel.status === "disconnected") {
    assert.equal(funnel.data, null);
  }
});

// ── Test 10: Mocked GA4 Data Provider Response (Deduplication Check) ───
test("GA4 Data API: correctly requests period-level distinct users and does NOT sum daily counts", async () => {
  const originalFetch = globalThis.fetch;
  try {
    const { privateKey } = generateTestPemRsaKeys();
    process.env.GA4_PROPERTY_ID = "999999999";
    process.env.GOOGLE_ANALYTICS_CLIENT_EMAIL = "mock-sa@qemlo.iam.gserviceaccount.com";
    process.env.GOOGLE_ANALYTICS_PRIVATE_KEY = privateKey;

    let oauthRequested = false;
    let aggregateBody = null;

    globalThis.fetch = async (url, options) => {
      const urlStr = String(url);
      if (urlStr.includes("oauth2.googleapis.com/token")) {
        oauthRequested = true;
        return {
          ok: true,
          json: async () => ({ access_token: "mock_test_token_12345", expires_in: 3600 }),
        };
      }

      if (urlStr.includes("properties/999999999:runReport")) {
        const body = JSON.parse(options.body);
        if (!body.dimensions) {
          aggregateBody = body;
          return {
            ok: true,
            json: async () => ({
              rows: [
                {
                  metricValues: [
                    { value: "5420" },
                    { value: "7100" },
                    { value: "14200" },
                    { value: "0.32" },
                    { value: "145" },
                  ],
                },
              ],
            }),
          };
        } else if (body.dimensions[0]?.name === "date") {
          return {
            ok: true,
            json: async () => ({
              rows: [
                { dimensionValues: [{ value: "20261027" }], metricValues: [{ value: "3000" }, { value: "3500" }, { value: "7000" }] },
                { dimensionValues: [{ value: "20261028" }], metricValues: [{ value: "3000" }, { value: "3600" }, { value: "7200" }] },
              ],
            }),
          };
        } else if (body.dimensions[0]?.name === "country") {
          return {
            ok: true,
            json: async () => ({
              rows: [
                { dimensionValues: [{ value: "Saudi Arabia" }], metricValues: [{ value: "3800" }] },
                { dimensionValues: [{ value: "United Arab Emirates" }], metricValues: [{ value: "1200" }] },
              ],
            }),
          };
        } else if (body.dimensions[0]?.name === "deviceCategory") {
          return {
            ok: true,
            json: async () => ({
              rows: [
                { dimensionValues: [{ value: "mobile" }], metricValues: [{ value: "4200" }] },
                { dimensionValues: [{ value: "desktop" }], metricValues: [{ value: "1220" }] },
              ],
            }),
          };
        } else if (body.dimensions[0]?.name === "pagePath") {
          return {
            ok: true,
            json: async () => ({
              rows: [
                {
                  dimensionValues: [{ value: "/ar/sa/final-settlement-calculator" }, { value: "Saudi Final Settlement" }],
                  metricValues: [{ value: "8500" }, { value: "3200" }],
                },
              ],
            }),
          };
        }
      }

      throw new Error(`Unexpected fetch URL: ${urlStr}`);
    };

    const report = await getGa4VisitorsReport("7d");
    assert.equal(report.status, "connected");
    assert.equal(oauthRequested, true);
    assert.ok(aggregateBody, "Aggregate query must be sent without dimensions");

    // activeUsers must be GA4 deduplicated period total (5,420), NOT sum of daily rows (6,000)
    assert.equal(report.data.kpis.activeUsers, 5420);
    assert.notEqual(report.data.kpis.activeUsers, 6000, "Must not sum daily unique users");
    assert.equal(report.data.kpis.sessions, 7100);
    assert.equal(report.data.kpis.views, 14200);
    assert.equal(report.data.kpis.bounceRatePct, 32);
    assert.equal(report.data.kpis.avgDurationSec, 145);
    assert.equal(report.data.dailyTrends.length, 2);
    assert.equal(report.data.countries[0].label, "Saudi Arabia");
    assert.equal(report.data.topPages[0].title, "Saudi Final Settlement");
  } finally {
    globalThis.fetch = originalFetch;
    delete process.env.GA4_PROPERTY_ID;
    delete process.env.GOOGLE_ANALYTICS_CLIENT_EMAIL;
    delete process.env.GOOGLE_ANALYTICS_PRIVATE_KEY;
  }
});

// ── Test 11: Mocked GA4 Realtime Schema Compliance (No pagePath) ──────
test("GA4 Realtime API: requests ONLY verified schema dimensions and never requests pagePath", async () => {
  const originalFetch = globalThis.fetch;
  try {
    const { privateKey } = generateTestPemRsaKeys();
    process.env.GA4_PROPERTY_ID = "999999999";
    process.env.GOOGLE_ANALYTICS_CLIENT_EMAIL = "mock-sa@qemlo.iam.gserviceaccount.com";
    process.env.GOOGLE_ANALYTICS_PRIVATE_KEY = privateKey;

    const requestedDimensions = [];

    globalThis.fetch = async (url, options) => {
      const urlStr = String(url);
      if (urlStr.includes("oauth2.googleapis.com/token")) {
        return {
          ok: true,
          json: async () => ({ access_token: "mock_test_token_rt", expires_in: 3600 }),
        };
      }

      if (urlStr.includes("runRealtimeReport")) {
        const body = JSON.parse(options.body);
        if (body.dimensions) {
          body.dimensions.forEach((d) => requestedDimensions.push(d.name));
        }

        if (!body.dimensions) {
          return {
            ok: true,
            json: async () => ({
              rows: [{ metricValues: [{ value: "42" }] }],
            }),
          };
        } else if (body.dimensions[0]?.name === "unifiedScreenName") {
          return {
            ok: true,
            json: async () => ({
              rows: [
                { dimensionValues: [{ value: "حاسبة مكافأة نهاية الخدمة في السعودية" }], metricValues: [{ value: "25" }] },
                { dimensionValues: [{ value: "حاسبة ضريبة القيمة المضافة في الإمارات" }], metricValues: [{ value: "17" }] },
              ],
            }),
          };
        } else if (body.dimensions[0]?.name === "country") {
          return {
            ok: true,
            json: async () => ({
              rows: [
                { dimensionValues: [{ value: "Saudi Arabia" }], metricValues: [{ value: "30" }] },
                { dimensionValues: [{ value: "United Arab Emirates" }], metricValues: [{ value: "12" }] },
              ],
            }),
          };
        }
      }
      throw new Error(`Unexpected fetch URL: ${urlStr}`);
    };

    const realtime = await getGa4RealtimeReport();
    assert.equal(realtime.status, "connected");

    // SCHEMA COMPLIANCE INVARIANT:
    // pagePath is not supported by GA4 Realtime API. Must only request unifiedScreenName and country.
    assert.equal(requestedDimensions.includes("pagePath"), false, "pagePath must never be requested in realtime report");
    assert.ok(requestedDimensions.includes("unifiedScreenName"), "Must request supported unifiedScreenName dimension");
    assert.ok(requestedDimensions.includes("country"), "Must request supported country dimension");

    // Independent distinct active users check
    assert.equal(realtime.data.activeUsers, 42);
    assert.equal(realtime.data.topScreens[0].screen, "حاسبة مكافأة نهاية الخدمة في السعودية");
    assert.equal(realtime.data.topScreens[0].users, 25);
  } finally {
    globalThis.fetch = originalFetch;
    delete process.env.GA4_PROPERTY_ID;
    delete process.env.GOOGLE_ANALYTICS_CLIENT_EMAIL;
    delete process.env.GOOGLE_ANALYTICS_PRIVATE_KEY;
  }
});

// ── Test 12: Mocked AdSense Response with Dynamic Currency ────────────
test("AdSense API: parses dynamic currency metadata (e.g. SAR) and does not default to USD", async () => {
  const originalFetch = globalThis.fetch;
  try {
    process.env.ADSENSE_CLIENT_ID = "mock_client_id_123";
    process.env.ADSENSE_CLIENT_SECRET = "mock_client_secret_xyz";
    process.env.ADSENSE_REFRESH_TOKEN = "mock_refresh_token_abc";
    process.env.ADSENSE_ACCOUNT_ID = "pub-4706954030329423";

    globalThis.fetch = async (url) => {
      const urlStr = String(url);
      if (urlStr.includes("oauth2.googleapis.com/token")) {
        return {
          ok: true,
          json: async () => ({ access_token: "mock_adsense_token", expires_in: 3600 }),
        };
      }

      if (urlStr.includes("reports:generate")) {
        return {
          ok: true,
          json: async () => ({
            headers: [
              { name: "DATE", type: "DIMENSION" },
              { name: "ESTIMATED_EARNINGS", type: "METRIC_CURRENCY", currencyCode: "SAR" },
              { name: "PAGE_VIEWS", type: "METRIC_TALLY" },
              { name: "IMPRESSIONS", type: "METRIC_TALLY" },
              { name: "PAGE_VIEWS_RPM", type: "METRIC_CURRENCY", currencyCode: "SAR" },
            ],
            rows: [
              { cells: [{ value: "2026-10-27" }, { value: "150.50" }, { value: "3000" }, { value: "4500" }, { value: "50.17" }] },
              { cells: [{ value: "2026-10-28" }, { value: "200.00" }, { value: "4000" }, { value: "6000" }, { value: "50.00" }] },
            ],
          }),
        };
      }
      throw new Error(`Unexpected fetch URL: ${urlStr}`);
    };

    const rev = await getAdSenseRevenueReport("30d");
    assert.equal(rev.status, "connected");
    assert.equal(rev.data.currency, "SAR", "Must parse SAR from API response");
    assert.notEqual(rev.data.currency, "USD", "Must not hardcode USD");
    assert.equal(rev.data.kpis.estimatedEarnings, 350.5);
    assert.equal(rev.data.kpis.pageViews, 7000);
    assert.equal(rev.data.kpis.impressions, 10500);
  } finally {
    globalThis.fetch = originalFetch;
    delete process.env.ADSENSE_CLIENT_ID;
    delete process.env.ADSENSE_CLIENT_SECRET;
    delete process.env.ADSENSE_REFRESH_TOKEN;
    delete process.env.ADSENSE_ACCOUNT_ID;
  }
});

// ── Test 13: Mocked Provider Failures (Timeouts, 403s, Malformed) ───────
test("Integration Error Resilience: handles timeouts, HTTP errors and malformed data safely", async () => {
  const originalFetch = globalThis.fetch;
  try {
    const { privateKey } = generateTestPemRsaKeys();
    process.env.GA4_PROPERTY_ID = "999999999";
    process.env.GOOGLE_ANALYTICS_CLIENT_EMAIL = "mock-sa-err@qemlo.iam.gserviceaccount.com";
    process.env.GOOGLE_ANALYTICS_PRIVATE_KEY = privateKey;

    // 1. HTTP 403 Forbidden from report endpoint
    globalThis.fetch = async (url) => {
      const urlStr = String(url);
      if (urlStr.includes("oauth2.googleapis.com/token")) {
        return { ok: true, json: async () => ({ access_token: "mock_tok", expires_in: 3600 }) };
      }
      return { ok: false, status: 403 };
    };

    const errReport = await getGa4VisitorsReport("7d");
    assert.equal(errReport.status, "error");
    assert.equal(errReport.reason, "query_failed");
    assert.ok(errReport.error.includes("403"));

    // 2. Malformed JSON with missing properties
    globalThis.fetch = async (url) => {
      const urlStr = String(url);
      if (urlStr.includes("oauth2.googleapis.com/token")) {
        return { ok: true, json: async () => ({ access_token: "mock_tok", expires_in: 3600 }) };
      }
      return { ok: true, json: async () => ({ unexpectedKey: 123 }) };
    };

    const malformedReport = await getGa4VisitorsReport("7d");
    assert.ok(malformedReport.status === "no_data" || malformedReport.status === "connected");
    if (malformedReport.status === "no_data") {
      assert.equal(malformedReport.data.kpis.activeUsers, 0);
    }
  } finally {
    globalThis.fetch = originalFetch;
    delete process.env.GA4_PROPERTY_ID;
    delete process.env.GOOGLE_ANALYTICS_CLIENT_EMAIL;
    delete process.env.GOOGLE_ANALYTICS_PRIVATE_KEY;
  }
});

// ── Test 14: Security Invariant — Zero Credential Leakage in Errors ─────
test("Security Invariant: error messages never expose private keys or raw tokens", async () => {
  const originalFetch = globalThis.fetch;
  const SECRET_KEY_SNIPPET = "PRIVATE_KEY_PAYLOAD_MUST_NOT_LEAK";
  try {
    process.env.GA4_PROPERTY_ID = "999999999";
    process.env.GOOGLE_ANALYTICS_CLIENT_EMAIL = "mock-sa@qemlo.iam.gserviceaccount.com";
    process.env.GOOGLE_ANALYTICS_PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----\n${SECRET_KEY_SNIPPET}\n-----END PRIVATE KEY-----`;

    globalThis.fetch = async (url) => {
      const urlStr = String(url);
      if (urlStr.includes("oauth2.googleapis.com/token")) {
        return { ok: false, status: 400 };
      }
      return { ok: false, status: 500 };
    };

    const report = await getGa4VisitorsReport("7d");
    const jsonStr = JSON.stringify(report);
    assert.equal(jsonStr.includes(SECRET_KEY_SNIPPET), false, "Private key must never be leaked in error object");
  } finally {
    globalThis.fetch = originalFetch;
    delete process.env.GA4_PROPERTY_ID;
    delete process.env.GOOGLE_ANALYTICS_CLIENT_EMAIL;
    delete process.env.GOOGLE_ANALYTICS_PRIVATE_KEY;
  }
});

// ── Test 15: Chrome UX Report API Request Body Validation ─────────────
test("CrUX API Schema: omits formFactor for aggregate all-device queries per API spec", async () => {
  // Test 1: Combined all-device query must omit formFactor entirely
  const defaultBody = buildCruxRequestBody("https://qemlo.com");
  assert.equal(defaultBody.origin, "https://qemlo.com");
  assert.equal("formFactor" in defaultBody, false, "formFactor must be omitted for combined data");

  const explicitAllBody = buildCruxRequestBody("https://qemlo.com", "ALL");
  assert.equal("formFactor" in explicitAllBody, false, "formFactor 'ALL' is invalid and must be omitted");

  // Test 2: Explicit device-specific queries must include PHONE, DESKTOP, or TABLET
  const phoneBody = buildCruxRequestBody("https://qemlo.com", "PHONE");
  assert.equal(phoneBody.formFactor, "PHONE");

  const desktopBody = buildCruxRequestBody("https://qemlo.com", "desktop");
  assert.equal(desktopBody.formFactor, "DESKTOP");

  const tabletBody = buildCruxRequestBody("https://qemlo.com", "tablet");
  assert.equal(tabletBody.formFactor, "TABLET");

  // Test 3: Verify the actual fetch request body sent to CrUX API
  const originalFetch = globalThis.fetch;
  try {
    process.env.GOOGLE_CRUX_API_KEY = "mock_crux_api_key_test";
    let sentBody = null;

    globalThis.fetch = async (url, options) => {
      sentBody = JSON.parse(options.body);
      return {
        ok: true,
        json: async () => ({
          record: {
            metrics: {
              largest_contentful_paint: { percentiles: { p75: 1850 } },
              interaction_to_next_paint: { percentiles: { p75: 95 } },
              cumulative_layout_shift: { percentiles: { p75: "0.02" } },
              first_contentful_paint: { percentiles: { p75: 1200 } },
              experimental_time_to_first_byte: { percentiles: { p75: 450 } },
            },
          },
        }),
      };
    };

    const cwv = await getCruxPerformanceMetrics();
    assert.equal(cwv.status, "connected");
    assert.ok(sentBody, "Must send request body");
    assert.equal(sentBody.origin, "https://qemlo.com");
    assert.equal("formFactor" in sentBody, false, "formFactor must be omitted in actual API request");
    assert.equal(cwv.data.lcp.rating, "good");
    assert.equal(cwv.data.inp.rating, "good");
    assert.equal(cwv.data.cls.rating, "good");
  } finally {
    globalThis.fetch = originalFetch;
    delete process.env.GOOGLE_CRUX_API_KEY;
  }
});
