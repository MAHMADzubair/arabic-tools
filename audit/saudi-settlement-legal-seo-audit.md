# Day 4 — Saudi Final Settlement Calculator: Legal Accuracy & Arabic SEO Audit

**Component under review:** `components/FinalSettlementCalculator.jsx`
**Page under review:** `app/ar/sa/final-settlement-calculator/page.js`
**Audit date:** 2026-10-23
**Auditor:** Kiro (automated review against official Saudi sources)

> This audit verifies the calculator's legal-calculation accuracy against the Saudi Labor Law
> (Royal Decree M/51 of 23/8/1426H, 27 Sep 2005) **as amended by the 2024/2025 amendments
> effective 18 February 2025**, and reviews the Arabic SEO of the published page. Each item is
> marked **VERIFIED**, **UNCERTAIN**, or **POTENTIALLY INCORRECT**. Only independently proven
> defects should be fixed; this audit found **no calculation defects requiring a code change**.

---

## 1. Governing law & effective amendments

- Base statute: Saudi Labor Law, Royal Decree **M/51** (1426H / 2005), administered by the
  Ministry of Human Resources and Social Development (HRSD).
- 2024/2025 amendments (Cabinet-approved Safar 1446H; in force **18 Feb 2025**) revised the
  notice-period rules and other provisions; the end-of-service (EOSB) articles 84/85/87 remain
  the basis for gratuity.
- Sources:
  - HRSD — Labor Law & regulations: https://www.hrsd.gov.sa/knowledge-centre/decisions-and-regulations/regulation-and-procedures/%D9%86%D8%B8%D8%A7%D9%85-%D8%A7%D9%84%D8%B9%D9%85%D9%84
  - HRSD — Cabinet approval of Labor Law amendments (2024): https://www.hrsd.gov.sa/en/media-center/news/060720242
  - DLA Piper — amendments in force 18 Feb 2025: https://knowledge.dlapiper.com/dlapiperknowledge/globalemploymentlatestdevelopments/2024/Amendments-to-the-KSA-Labour-Law
  - Addleshaw Goddard — 2025 KSA Labour Law amendments: https://www.addleshawgoddard.com/en/insights/insights-briefings/2025/employment/navigating-new-horizon-understanding-2025-amendments-ksa-labour-law/

---

## 2. Calculation review

### 2.1 End-of-service benefit base (Art. 84) — **VERIFIED**
- Law: on end of the work relation the employer pays a half-month wage for each of the first
  five years and a one-month wage for each following year, based on the **last wage**, pro-rated
  for partial years.
- Code (`FinalSettlementCalculator.jsx`):
  `fullGratuity = totalWage * 0.5 * min(serviceYears,5) + totalWage * 1.0 * max(0, serviceYears-5)`.
  Matches Art. 84 exactly.
- Wage base uses **total wage** (basic + fixed periodic allowances: housing, transport, other),
  which is the "last wage" per Art. 2's wage definition and HRSD guidance. Correct.
- Sources:
  - HRSD article 317: https://www.hrsd.gov.sa/en/knowledge-centre/articles/317
  - OECD EPL (verbatim Art. 84): https://www.oecd.org/content/dam/oecd/en/data/datasets/indicators-of-employment-protection-2013/SaudiArabia-EPL2013.pdf

### 2.2 Resignation tapering (Art. 85) — **VERIFIED**
- Law: resignation → not entitled under 2 years; **1/3** for 2–5 years; **2/3** for over 5 but
  under 10 years; **full** for 10+ years. The boundary at exactly 5 years is 1/3 (the law phrases
  the 2/3 tier as "in excess of five ... less than ten").
- Code thresholds: `<2 → 0`, `<=5 → 1/3`, `<10 → 2/3`, `else → 1.0`. Exactly 5 maps to 1/3 and
  exactly 10 maps to full — both correct.
- Regression coverage: `tests/employmentCalculators6D.test.mjs` (FIX 1: exactly 5y = 1/3 not 2/3;
  FIX 2: exactly 5y final settlement = 1/3; 1 day past 5y → 2/3) and the new component tests in
  `tests/final-settlement-calculator.test.js` all pass.
- Source: OECD EPL (verbatim Art. 85): https://www.oecd.org/content/dam/oecd/en/data/datasets/indicators-of-employment-protection-2013/SaudiArabia-EPL2013.pdf

### 2.3 Female special full award (Art. 87) — **VERIFIED**
- Law: a female worker is entitled to the **full** award if the relation ends within 6 months of
  her marriage or within 3 months of giving birth (and full award also applies in force-majeure
  cases).
- Code: reason `female_special` → `esobPercent = 1.0` with note citing Art. 87. Correct.
- Source: HRSD article 317 (Art. 87 conditions): https://www.hrsd.gov.sa/en/knowledge-centre/articles/317

### 2.4 Termination types — **VERIFIED** (with documented scope limitation)
- Code maps `terminate`, `retire`, `mutual`, `fixed_expired` → full (100%); `resign` → Art. 85
  tapering; `female_special` → full (Art. 87). All match the law for ordinary endings.
- **Scope limitation (not a defect):** Art. 80 lists misconduct causes under which a worker
  forfeits EOSB; the calculator does not model for-cause forfeiture. This is an intentional
  simplification, clearly disclosed by the in-app "تقديرية استرشادية" (estimative/advisory)
  disclaimer. No change required for this scope.

### 2.5 Notice period (Art. 75) — **VERIFIED**
- Law (post-2025 amendment, in force 18 Feb 2025): indefinite monthly-paid contracts → **30 days**
  notice when the **employee** initiates termination, **60 days** when the **employer** initiates.
- Code: `resign → noticeRequired 30` (shortfall deducted from the worker if unserved);
  `terminate → noticeRequired 60` (shortfall paid to the worker if unserved). Matches the
  amended law exactly.
- Source: Addleshaw Goddard (30/60-day revision) and DLA Piper (effective date):
  https://www.addleshawgoddard.com/en/insights/insights-briefings/2025/employment/navigating-new-horizon-understanding-2025-amendments-ksa-labour-law/

### 2.6 Notice in lieu (Art. 76) — **VERIFIED**
- Law: the party failing to give/maintain notice must compensate the other with wages for the
  un-served notice period.
- Code computes `noticePay = dailyWage * missedDays` and assigns it as an addition (to worker) or
  deduction (to employer) based on who gave notice. Correct.

### 2.7 Leave compensation (Art. 111) — **VERIFIED with UNCERTAIN wage base**
- Law: on leaving, the worker is entitled to cash compensation for unused annual leave, calculated
  on the wage.
- Code: `leavePay = leaveDays * (leaveBase / divisor)` with `leaveBase` defaulting to **total
  actual wage** and an option to use **basic salary only**.
- **Wage base — UNCERTAIN but defensible:** the statute says "wage" without fixing basic vs.
  total. Saudi labor courts commonly adopt the total/actual wage. The component defaults to total
  (judicially prevalent) and offers basic as a contract-driven alternative, which is reasonable.
- **Daily divisor ÷30 — UNCERTAIN (convention, not statutory):** the law does not fix the
  daily-rate divisor; ÷30 is the prevailing Saudi contractual practice. The component offers
  ÷30 / ÷26 / ÷22, so this is user-configurable, not a defect.

### 2.8 Fractional service — **VERIFIED** (method is convention)
- Law: the worker is entitled to EOSB for portions of a year in proportion to time spent.
- Code: `calcServiceMonths` prorates residual days. The day-proration method (residual days ÷30)
  is a common convention; the statute prescribes pro-rata but not the exact method. No defect.

### 2.9 Overtime (Art. 107) — **VERIFIED** (cross-check)
- Law: overtime = hourly wage + 50% of basic hourly wage.
- `tests/employmentCalculators6D.test.mjs` FIX 4 verifies the golden example (6k basic + 3k
  allowances, 10h OT = SAR 500). Source: HRSD article 312:
  https://www.hrsd.gov.sa/en/knowledge-centre/articles/312

---

## 3. Summary of findings

| Item | Status | Source |
|---|---|---|
| EOSB base (Art. 84) | VERIFIED | HRSD 317 / OECD |
| Resignation taper (Art. 85) | VERIFIED | OECD (verbatim) |
| Female full award (Art. 87) | VERIFIED | HRSD 317 |
| Termination types | VERIFIED (scope note: Art. 80 not modeled) | HRSD 317 |
| Notice 30/60 (Art. 75) | VERIFIED | Addleshaw / DLA Piper (2025) |
| Notice in lieu (Art. 76) | VERIFIED | Labor Law |
| Leave comp (Art. 111) | VERIFIED — wage base & ÷30 UNCERTAIN (defensible) | Labor Law |
| Fractional service | VERIFIED — proration method UNCERTAIN (convention) | Art. 84 |
| Overtime (Art. 107) | VERIFIED | HRSD 312 |

**Potentially incorrect calculations:** none found.
**Defects requiring a code fix:** none — the calculation logic matches the cited law and
amendments. The only "uncertain" items are statutorily-unspecified conventions (wage base for
leave, the ÷30 divisor, residual-day proration), all of which the calculator exposes as
user-configurable options rather than hard-coding a single contested value.

**Citation caveat:** the page footer cites the amendment decree as "م/14"; multiple amendment
decrees exist in the legislative history (e.g., M/24/1434, M/144/1444, and the 2024
Cabinet-approved package). The substantive rules cited are correct; the specific amendment-decree
**number** could not be independently confirmed and is marked **UNCERTAIN**.

---

## 4. Arabic SEO audit

| Signal | Status | Notes |
|---|---|---|
| Arabic `<title>` with year + keywords | PASS | Includes "2026", "مخالصة", "مكافأة", "إجازة", "إشعار" |
| Arabic meta description | PASS | Comprehensive, under ~155–300 chars |
| Arabic keywords array | PASS | Arabic + English (EOSB) terms |
| Canonical URL | PASS | `/ar/sa/final-settlement-calculator` |
| hreflang alternates | PASS | `ar-SA`, `ar-AE` |
| OpenGraph (locale ar_SA, OG image) | PASS | |
| JSON-LD: FAQPage / SoftwareApp / BreadcrumbList | PASS | Rich structured data present |
| `dir="rtl"` on `<main>` | PASS | Correct RTL document direction |
| Breadcrumb navigation | PASS | With `aria-current` |
| Editorial Arabic content | PASS | Explanation, steps, worked example, legal articles |
| Internal linking | PASS | Related Saudi tool chain + related tools |
| Authority citation + disclaimer + last-reviewed date | PASS | Links HRSD, "ودي" platform, review date 2026 |
| Impact of Day 4 label change on SEO | NONE | "مكافأة نهاية الخدمة المستحقة" is client-rendered UI text in the results breakdown, not metadata/structured data; no title/description/canonical/JSON-LD change. |

**SEO conclusion:** the page is well-optimized for Arabic search. The Day 4 change (legal label
rewording) introduces **no SEO regression** and slightly improves user-facing legal clarity.

---

## 5. Recommendation

No calculation defects were proven, so **no formula changes are applied**. Recommendations for a
future hardening pass (out of this PR's scope): optionally document the Art. 80 forfeiture
exclusion in the disclaimer text, and reconcile the exact amendment-decree number in the footer
citation against the HRSD-published amendment instrument.
