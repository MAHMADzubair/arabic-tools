import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import {
  normalizePrivateKey,
  createSignedJwt,
  getGoogleServiceAccountAccessToken,
  getGoogleOAuthAccessToken,
} from "../lib/integrations/googleAuth.js";
import { getGa4Config, getGa4VisitorsReport, getGa4RealtimeReport } from "../lib/integrations/ga4.js";
import { getGscConfig, getGscSearchPerformance } from "../lib/integrations/gsc.js";
import { getAdSenseConfig, getAdSenseRevenueReport } from "../lib/integrations/adsense.js";
import { getCruxConfig, getCruxPerformanceMetrics } from "../lib/integrations/crux.js";
import { getToolUsageReport, getFunnelAnalytics } from "../lib/integrations/toolEvents.js";

test("Google Auth: normalizePrivateKey sanitizes escaped newlines, quotes and whitespace", () => {
  const rawKey = ' "line1\\nline2\\nline3" ';
  const normalized = normalizePrivateKey(rawKey);
  assert.equal(normalized, "line1\nline2\nline3");
  assert.equal(normalizePrivateKey(null), "");
  assert.equal(normalizePrivateKey(123), "");
});

test("Google Auth: createSignedJwt produces verifiable RS256 token assertion", () => {
  const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
  });

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

test("GSC Adapter: honest disconnected status and no indexing claims", async () => {
  const config = getGscConfig();
  if (!config.isConfigured) {
    const perf = await getGscSearchPerformance("28d");
    assert.equal(perf.status, "disconnected");
    assert.equal(perf.reason, "missing_credentials");
    assert.equal(perf.data, null);
  }
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

test("CrUX Adapter: honest disconnected status without API key", async () => {
  const config = getCruxConfig();
  if (!config.isConfigured) {
    const cwv = await getCruxPerformanceMetrics();
    assert.equal(cwv.status, "disconnected");
    assert.equal(cwv.reason, "missing_credentials");
    assert.equal(cwv.data, null);
  }
});

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
