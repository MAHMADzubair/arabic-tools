// tests/verify-admin-http.mjs
// Boots Next.js on port 3008 and executes real HTTP requests to verify admin endpoints.

import { spawn } from "node:child_process";
import assert from "node:assert/strict";

const PORT = 3008;
const BASE_URL = `http://localhost:${PORT}`;

async function waitForServer(url, timeoutMs = 25000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${url}/robots.txt`);
      if (res.status === 200) return true;
    } catch {
      // not ready yet
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error("Server failed to start within timeout");
}

async function runTests() {
  console.log(`Starting Next.js production server on port ${PORT}...`);
  const server = spawn("npx", ["next", "start", "-p", String(PORT)], {
    cwd: process.cwd(),
    shell: true,
    stdio: "inherit",
    env: { ...process.env, PORT: String(PORT), ADMIN_SECRET: "test-admin-secret-http-12345" },
  });

  try {
    await waitForServer(BASE_URL);
    console.log("Server ready! Running HTTP route assertions...\n");

    // 1. GET /api/internal/auth -> 405 Method Not Allowed
    console.log("1. Testing GET /api/internal/auth...");
    const getAuthRes = await fetch(`${BASE_URL}/api/internal/auth`);
    assert.equal(getAuthRes.status, 405, "GET /api/internal/auth must return 405");
    assert.equal(getAuthRes.headers.get("allow"), "POST", "Must contain Allow: POST header");
    console.log("   ✓ HTTP 405 Method Not Allowed (Allow: POST)");

    // 2. POST /api/internal/auth CSRF protection -> 403 Forbidden
    console.log("2. Testing POST /api/internal/auth CSRF origin check...");
    const csrfRes = await fetch(`${BASE_URL}/api/internal/auth`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: "https://malicious-site.example.com",
      },
      body: JSON.stringify({ password: "wrong" }),
    });
    assert.equal(csrfRes.status, 403, "Mismatched origin must return 403");
    const csrfBody = await csrfRes.json();
    assert.equal(csrfBody.error, "cross_origin_forbidden");
    console.log("   ✓ HTTP 403 Forbidden (cross_origin_forbidden)");

    // 3. POST /api/internal/auth Invalid Password -> 401 Unauthorized
    console.log("3. Testing POST /api/internal/auth bad password...");
    const badPwRes = await fetch(`${BASE_URL}/api/internal/auth`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: BASE_URL,
      },
      body: JSON.stringify({ password: "invalid-password-test" }),
    });
    assert.equal(badPwRes.status, 401, "Bad password must return 401");
    const badPwBody = await badPwRes.json();
    assert.equal(badPwBody.error, "unauthorized");
    console.log("   ✓ HTTP 401 Unauthorized (unauthorized)");

    // 4. GET /api/internal/pilot-leads Unauthenticated -> 401 Unauthorized
    console.log("4. Testing GET /api/internal/pilot-leads without cookie...");
    const leadsApiRes = await fetch(`${BASE_URL}/api/internal/pilot-leads`);
    assert.equal(leadsApiRes.status, 401, "Unauthenticated GET must return 401");
    const leadsApiBody = await leadsApiRes.json();
    assert.equal(leadsApiBody.error, "Unauthorized");
    console.log("   ✓ HTTP 401 Unauthorized");

    // 5. GET /internal/pilot-leads Page Unauthenticated -> Redirect to /internal/login
    console.log("5. Testing GET /internal/pilot-leads page without cookie...");
    const leadsPageRes = await fetch(`${BASE_URL}/internal/pilot-leads`, {
      redirect: "manual",
    });
    // Next.js redirect uses 307
    assert.ok(
      leadsPageRes.status === 307 || leadsPageRes.status === 302,
      `Expected redirect 307/302, got ${leadsPageRes.status}`
    );
    const location = leadsPageRes.headers.get("location");
    assert.ok(
      location.includes("/internal/login"),
      `Redirect target must be /internal/login, got: ${location}`
    );
    console.log(`   ✓ HTTP ${leadsPageRes.status} Redirect -> ${location}`);

    // 6. GET /robots.txt -> Verify rules
    console.log("6. Testing GET /robots.txt...");
    const robotsRes = await fetch(`${BASE_URL}/robots.txt`);
    assert.equal(robotsRes.status, 200, "robots.txt must return 200");
    const robotsText = await robotsRes.text();
    assert.ok(robotsText.includes("Disallow: /api/"), "Must disallow /api/");
    assert.ok(robotsText.includes("Disallow: /internal/"), "Must disallow /internal/");
    console.log("   ✓ HTTP 200 robots.txt with disallows");

    console.log("\nALL 6 HTTP ADMIN ROUTE ASSERTIONS PASSED! ✅");
  } finally {
    console.log("Shutting down test server...");
    server.kill("SIGTERM");
  }
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
