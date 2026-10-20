/*
 * lib/gosiCalculator.js
 * Re-exports the unified, fully tested calculation engine from lib/gosiEngine.js.
 * Retained for backwards compatibility with any legacy imports.
 */

export { calculateGOSI, pensionRateForDate } from "./gosiEngine.js";
