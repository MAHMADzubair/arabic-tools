#!/usr/bin/env node
/**
 * IndexNow ping — tells Bing (and other IndexNow engines: Yandex, Naver,
 * Seznam) that qemlo.com URLs are new or changed, so they recrawl them
 * within hours instead of weeks. Bing's index also feeds ChatGPT search.
 *
 * The key file lives at public/<KEY>.txt and must stay deployed.
 *
 * Usage (after a deploy that changed pages):
 *   node scripts/indexnow-ping.mjs                 # every URL in the live sitemap
 *   node scripts/indexnow-ping.mjs /vat-calculator /ar/sa/zatca-wave-checker
 */
export const INDEXNOW_KEY = "db903e3831f8f603a19abbf2f0163461";
const HOST = "qemlo.com";
const ORIGIN = `https://${HOST}`;

export function buildPayload(urls) {
  return {
    host: HOST,
    key: INDEXNOW_KEY,
    keyLocation: `${ORIGIN}/${INDEXNOW_KEY}.txt`,
    urlList: urls.map((u) => (u.startsWith("http") ? u : `${ORIGIN}${u}`)),
  };
}

async function sitemapUrls() {
  const xml = await (await fetch(`${ORIGIN}/sitemap.xml`)).text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

async function main() {
  const args = process.argv.slice(2);
  const urls = args.length ? args : await sitemapUrls();
  if (!urls.length) throw new Error("No URLs to submit");
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(buildPayload(urls)),
  });
  // 200 = accepted, 202 = accepted (key validation pending)
  console.log(`IndexNow: ${res.status} for ${urls.length} URL(s)`);
  if (res.status >= 400) process.exitCode = 1;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((e) => {
    console.error(e.message);
    process.exitCode = 1;
  });
}
