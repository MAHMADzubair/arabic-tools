import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const layout = readFileSync(new URL("../app/layout.js", import.meta.url), "utf8");

test("global footer uses the active registry count instead of a stale 70+ claim", () => {
  assert.ok(layout.includes('import { getToolCount } from "@/lib/registry";'));
  assert.ok(layout.includes('new Intl.NumberFormat("ar-SA").format(getToolCount())'));
  assert.equal(layout.includes("٧٠+"), false);
});
