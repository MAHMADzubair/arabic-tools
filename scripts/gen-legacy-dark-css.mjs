// Regenerates app/legacy-dark.css from the palette classes used in app/ and components/.
// Run: node scripts/gen-legacy-dark-css.mjs
import fs from "node:fs";
import path from "node:path";
import { buildLegacyDarkCss, PALETTE_CLASS_RE } from "../lib/legacyDarkBridge.js";

const walk = (d) =>
  fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(d, e.name);
    return e.isDirectory() ? walk(p) : /\.(jsx?|tsx?)$/.test(e.name) ? [p] : [];
  });
export function usedPaletteClasses(root = ".") {
  const used = new Set();
  for (const f of [...walk(path.join(root, "app")), ...walk(path.join(root, "components"))])
    for (const m of fs.readFileSync(f, "utf8").matchAll(PALETTE_CLASS_RE)) used.add(m[0]);
  return [...used].sort();
}
if (import.meta.url === `file://${process.argv[1]}`) {
  const css = buildLegacyDarkCss(usedPaletteClasses());
  fs.writeFileSync("app/legacy-dark.css", css);
  console.log("app/legacy-dark.css", css.length, "bytes");
}
