import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { INDEXNOW_KEY, buildPayload } from "../scripts/indexnow-ping.mjs";

test("IndexNow key file is deployed from public/ and holds exactly the key", () => {
  const path = `public/${INDEXNOW_KEY}.txt`;
  assert.ok(existsSync(path), `${path} must exist`);
  assert.equal(readFileSync(path, "utf8").trim(), INDEXNOW_KEY);
  assert.match(INDEXNOW_KEY, /^[a-f0-9]{32}$/);
});

test("IndexNow payload uses the apex host and absolute URLs", () => {
  const p = buildPayload(["/vat-calculator", "https://qemlo.com/"]);
  assert.equal(p.host, "qemlo.com");
  assert.equal(p.keyLocation, `https://qemlo.com/${INDEXNOW_KEY}.txt`);
  assert.deepEqual(p.urlList, ["https://qemlo.com/vat-calculator", "https://qemlo.com/"]);
});
