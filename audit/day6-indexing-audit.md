# QEMLO Day 6 — Indexing & Internal Link Audit
**Date:** October 2026 | **Branch:** day6-indexing-audit

---

## Executive Summary

All 9 priority URLs are technically eligible for indexing. No URL is blocked by robots.txt, no noindex directive exists on production, no canonical points to a different URL, no redirect intercepts any of the 9 paths, and all 9 appear in the sitemap.

The "Discovered — currently not indexed" status in Google Search Console is most likely explained by **crawl depth and internal link gaps**, not technical blocking. Three confirmed actionable issues were found and fixed.

---

## Per-URL Findings

### 1. `/ar/ae/quotation-generator` ✅ Eligible
- Title: `"مولد عرض سعر الإمارات 2026 | نموذج Quotation مجاني"` ✅
- Canonical: self-referential ✅
- hreflang: `ar-SA → /ar/sa/quotation-generator`, `ar-AE → /ar/ae/quotation-generator` ✅
- JSON-LD: BreadcrumbList + SoftwareApplication + FAQPage (5 FAQs) ✅
- H1: Rendered inside `<UaeQuotationGenerator />` component ✅
- Internal links FROM page: to hub, to 5 related UAE tools, breadcrumbs ✅


### 2. `/ar/ae/vat-registration-checker` ✅ Eligible
- Title: `"حاسبة التسجيل في ضريبة القيمة المضافة الإمارات | VAT Registration UAE 2026"` ✅
- H1: Explicit `<h1>` in page.js hero section ✅
- JSON-LD: BreadcrumbList + SoftwareApplication + FAQPage (10 FAQs) ✅
- hreflang: ar-SA + ar-AE pair ✅


### 3. `/ar/sa/annual-leave-calculator` ✅ Eligible — **FIX-3 applied**
- Title: `"حاسبة بدل الإجازات السنوية في السعودية 2026"` ✅
- H1: Confirmed inside `<AnnualLeaveCalculator />` ✅
- JSON-LD: FAQPage + BreadcrumbList + SoftwareApplication ✅
- hreflang: **Missing before fix — self-referential only (ar-SA)** ✅
- Internal links FROM page: 4 related SA tools ✅


### 4. `/gratuity-calculator/saudi` ⚠️ Eligible — **FIX-1 applied**
- Title: `"حاسبة مكافأة نهاية الخدمة في السعودية 2026 | المادتان 84 و85"` ✅
- H1: Confirmed inside `<GratuityCalculator />` ✅
- JSON-LD: SoftwareApplication + BreadcrumbList via ToolGuideSection ✅
- hreflang: ar-SA + ar-AE pair ✅
- Internal links FROM page: CTA to final-settlement + ToolGuideSection related tools (**now includes /gratuity-calculator/uae, /salary-calculator/saudi, /overtime-calculator/saudi**) ✅

### 5. `/gratuity-calculator/uae` ⚠️ Eligible — **FIX-1 applied**
- Title: `"حاسبة مكافأة نهاية الخدمة في الإمارات 2026"` ✅
- JSON-LD: SoftwareApplication + BreadcrumbList via ToolGuideSection ✅
- hreflang: ar-SA + ar-AE pair ✅
- Internal links: CTA to final-settlement + updated ToolGuideSection ✅

### 6. `/salary-calculator/saudi` ⚠️ Eligible — **FIX-1 applied**
- Title: `"حاسبة الراتب الصافي في السعودية 2026 | خصم التأمينات GOSI وساند"` ✅
- H1: Confirmed `<h1 className="sc-h1">` ✅
- JSON-LD: SoftwareApplication + BreadcrumbList via ToolGuideSection ✅
- hreflang: ar-SA + ar-AE pair ✅
- Internal links: **Previously zero outbound. Now gets cross-links via ToolGuideSection.** ✅

### 7. `/salary-calculator/uae` ⚠️ Eligible — **FIX-1 applied**
- Similar to Saudi — no outbound links before fix. ToolGuideSection now cross-links ✅

### 8. `/overtime-calculator/saudi` ⚠️ Eligible — **FIX-1 applied**
- Title: `"حاسبة العمل الإضافي في السعودية 2026 | المادة 107"` ✅
- H1: Confirmed `<h1 className="ot-h1">` ✅
- Internal links: **Previously zero outbound. Now gets cross-links via ToolGuideSection.** ✅

### 9. `/overtime-calculator/uae` ⚠️ Eligible — **FIX-1 applied**
- Similar to Saudi. ToolGuideSection now cross-links ✅

---

## Confirmed Fixes Applied

### FIX-1 — ToolGuideSection `allTools` (6 URLs added)
**File:** `components/ToolGuideSection.jsx`

Added to the `allTools` array:
- `/salary-calculator/saudi`
- `/salary-calculator/uae`
- `/gratuity-calculator/saudi`
- `/gratuity-calculator/uae`
- `/overtime-calculator/saudi`
- `/overtime-calculator/uae`

These 6 country-specific pages were absent from the related-tool list. The salary and overtime pages had zero outbound tool links before this fix.

### FIX-2 — Homepage → Country Hub Links
**File:** `app/page.js`

Added a small `أدوات دول الخليج` strip with crawlable `<a href="/ar/sa">` and `<a href="/ar/ae">` links just before the Features section. Previously the hubs were unreachable from the homepage via anchor links.

### FIX-3 — hreflang on Annual Leave Calculator
**File:** `app/ar/sa/annual-leave-calculator/page.js`

Added `languages: { "ar-SA": "/ar/sa/annual-leave-calculator" }` to the metadata alternates. No ar-AE alternate exists.

---

## What Was Confirmed Clean (No Changes Made)

- All 9 canonical values — self-referential ✅
- Production robots.txt — `Allow: /` for all 9 ✅
- X-Robots-Tag — only noindex on preview, not production ✅
- middleware.js — no redirect rules for any of the 9 ✅
- Sitemap — all 60 URLs present at appropriate priorities ✅
- Country hubs `/ar/ae` and `/ar/sa` — real static HTML with crawlable anchor links to all tools ✅
- H1 elements — all confirmed in component source ✅
- No duplicate content or cross-pointing canonicals ✅

---

## Unverified Hypotheses

1. H1 inside `UaeQuotationGenerator` (`"use client"`) — component renders an H1 but it is inside a client component. Pre-hydration HTML state unverified without a live render test.
2. Thin content perception on 124–139 line pages — cannot confirm without GSC data.
3. Generic vs. country-specific overlap — distinct content confirmed; crawl order/discovery issue not a blocking issue.

---

## Remaining 17 URLs — Observations

All remaining non-priority pages are:
- Not blocked by robots.txt
- Present in the sitemap
- Reachable via hub breadcrumbs

FIX-2 (homepage hub links) and FIX-1 (cross-linking) should improve crawlability for all of them indirectly. Recommend monitoring GSC for 4–6 weeks before further changes.

---

## Recommendation

Merge this PR and monitor Google Search Console for 4–6 weeks. Do not submit individual indexing requests — Google will re-crawl via the updated internal link graph and sitemap. If specific pages remain "Discovered — not indexed" after 6 weeks, investigate content quality on those specific pages.
