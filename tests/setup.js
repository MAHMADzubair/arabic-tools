// tests/setup.js
import { JSDOM } from "jsdom";

const { window } = new JSDOM("<!doctype html><html><body></body></html>");
global.window = window;
global.document = window.document;
// Define a mutable navigator object for jsdom environment
Object.defineProperty(global, "navigator", {
  value: { userAgent: "node.js" },
  configurable: true,
  writable: true,
});
// Optionally expose other globals needed by testing-library/react
global.HTMLElement = window.HTMLElement;
global.HTMLDivElement = window.HTMLDivElement;
