# Day 4 — Saudi Final Settlement Calculator: Legal Accuracy & Arabic SEO Audit

**Component under review:** `components/FinalSettlementCalculator.jsx`
**Page under review:** `app/ar/sa/final-settlement-calculator/page.js`
**Audit date:** 2026-10-23 (revised 2026-10-23 corrections pass)
**Auditor:** Kiro — automated review against official Saudi primary sources

> Each finding is marked **VERIFIED**, **UNCERTAIN**, or **CORRECTED (defect fixed in this PR)**.
> Only independently proven defects are changed in code or page copy.
> Conventions that the statute leaves unspecified are documented as UNCERTAIN and left
> user-configurable rather than hard-coded.

---

## 1. Governing law and effective amendments

### Base statute
Saudi Labor Law, Royal Decree **M/51**, dated 23/8/1426H (27 September 2005).
Administered by the Ministry of Human Resources and Social Development (HRSD — hrsd.gov.sa).

### Most recent amendment — CORRECTED
| Field | Previous (wrong) | Corrected |
|---|---|---|
| Decree number | م/14 | **م/44** |
| Hijri signing date | — | **8 Safar 1446H** |
| Gregorian signing date | stated as "23 August 2024" | **12 August 2024** |
| Official Gazette publication | — | **23 August 2024** |
| Effective date | stated as "18 February 2025" | **19 February 2025** |

**Primary official source — HRSD announcement (verbatim):**
> "…the enforcement of the amendments to the Labour Law issued under Royal Decree No. (44),
> dated **8 Safar 1446 AH (12/08/2024 AD)**…"

HRSD — Ministry announcement on publication of Executive Regulations:
https://www.hrsd.gov.sa/en/media-center/news/وزارة-الموارد-البشرية-والتنمية-الاجتماعية-تُعلن-عن-نشر-اللائحة-التنفيذية-لتعديلات-نظام-العمل

**Calendar verification:** Hijri-calendar.com Safar 1446 table confirms 8 Safar 1446H = **12 August 2024**:
https://hijri-calendar.com/en/Safar/1446

**Key distinction:**
- **Decree signing date:** 8 Safar 1446H = **12 August 2024** (when the King signed the decree)
- **Gazette publication date:** **23 August 2024** (when it appeared in Umm Al-Qura official gazette)
- **Effective date:** **19 February 2025** (180 days after gazette publication; confirmed by HRSD)

Previous audit incorrectly paired 8 Safar 1446H with the gazette date (23 Aug) rather than the
signing date (12 Aug). Both the page footer and this document have been corrected.

**Supporting sources:**
- HRSD — Implementing Regulations amendment project (cites "Decree No. 44, dated 08/02/1446"):
  https://www.hrsd.gov.sa/en/media-center/events/041120242
- Clyde & Co — "On 23 August 2024, Royal Decree M/44 was **published in the Official Gazette**":
  https://www.clydeco.com/en/insights/2025/03/ksa-labour-law-amendments-resignations
- Dentons — "proposed on 02/02/1446H corresponding to 06/08/2024G" (Cabinet decision date, not signing date):
  https://www.dentons.com/en/insights/alerts/2024/september/18/amendments-to-the-kingdom-of-saudi-arabia-labor-law-key-changes-for-employers-in-the-ksa-for-2025
- King & Spalding — gazette 23 August 2024, in force 19 February 2025 (180-day deferral):
  https://www.kslaw.com/insights/articles/amendments-to-the-saudi-labor-law-approved

**Note on the 19 February effective date:**
The HRSD announcement itself is the primary authoritative confirmation. One secondary source
(Al Tamimi, Nov 2024) stated 18 February; Morgan Lewis (Aug 2024) stated 25 February. Both
predate the MHRSD's own announcement confirming 19 February. See also:
- Global Payroll Alliance (citing HRSD/Argaam): https://gpa.net/blogs/middle-east/saudi-arabia-labor-law-amendments-now-in-effect
- HRSD official Labor Law page: https://www.hrsd.gov.sa/knowledge-centre/decisions-and-regulations/regulation-and-procedures/%D9%86%D8%B8%D8%A7%D9%85-%D8%A7%D9%84%D8%B9%D9%85%D9%84

---

## 2. Calculation-accuracy review

### 2.1 End-of-service benefit base (Art. 84) — VERIFIED

**Rule:** On end of the work relation the employer pays a **half-month wage** for each of the
first five years, and **one full month's wage** for each subsequent year, calculated on the
**last wage**, pro-rated for partial years.

**Code** (`FinalSettlementCalculator.jsx`):
```
const y1 = Math.min(serviceYears, 5);
const y2 = Math.max(0, serviceYears - 5);
const fullGratuity = totalWage * 0.5 * y1 + totalWage * 1.0 * y2;
```
Matches Art. 84 exactly.

**Wage base:** `totalWage` = basic + housing + transport + other fixed periodic allowances —
the "last wage" per Art. 2's definition and HRSD guidance. Correct.

**Sources:**
- HRSD article 317 (verbatim Art. 84 and Art. 87):
  https://www.hrsd.gov.sa/en/knowledge-centre/articles/317
- OECD EPL dataset, Saudi Arabia (verbatim Arts. 84 and 85):
  https://www.oecd.org/content/dam/oecd/en/data/datasets/indicators-of-employment-protection-2013/SaudiArabia-EPL2013.pdf

---

### 2.2 Resignation tapering (Art. 85) — VERIFIED

**Rule:**
| Service duration | Resignation entitlement |
|---|---|
| < 2 consecutive years | 0% (no award) |
| ≥ 2 years and ≤ 5 years | 1/3 of full award |
| > 5 years and < 10 years | 2/3 of full award |
| ≥ 10 years | 100% (full award) |

The boundary at **exactly 5 years** is 1/3, not 2/3. The statute phrases the 2/3 tier as
"in excess of five successive years but less than ten years."

**Code thresholds:**
```
if (serviceYears < 2)        esobPercent = 0;
else if (serviceYears <= 5)  esobPercent = 1/3;   // exactly 5 → 1/3 ✓
else if (serviceYears < 10)  esobPercent = 2/3;
else                         esobPercent = 1.0;   // exactly 10 → full ✓
```
Both boundaries are correct. Covered by regression tests:
- `tests/employmentCalculators6D.test.mjs` — FIX 1 (exactly 5y manual = 1/3 not 2/3),
  FIX 2 (exactly 5y final settlement = 1/3), 1 day past 5y → 2/3, exactly 10y → full.
- `tests/final-settlement-calculator.test.js` — component integration tests, all passing.

**Source:** OECD EPL (verbatim Art. 85):
https://www.oecd.org/content/dam/oecd/en/data/datasets/indicators-of-employment-protection-2013/SaudiArabia-EPL2013.pdf

---

### 2.3 Female special full award (Art. 87) — VERIFIED

**Rule:** A female worker who terminates within 6 months of marriage or 3 months of childbirth
receives the **full** award. Full award also applies in force-majeure cases.

**Code:** reason `female_special` → `esobPercent = 1.0` with note citing Art. 87. Correct.

**Source:** HRSD article 317:
https://www.hrsd.gov.sa/en/knowledge-centre/articles/317

---

### 2.4 Termination types and Art. 80 forfeiture — CORRECTED

**Ordinary termination (terminate / retire / mutual / fixed_expired):**
Under Art. 84, these cases receive full EOSB. This is what the calculator models.
Code note previously read: *"استحقاق كامل (100٪) وفق المادة (84) من نظام العمل"*

**Art. 80 for-cause dismissal — CORRECTED:**
Art. 80 lists specific misconduct grounds (fraud, assault, exceeding 15 consecutive or
30 non-consecutive unauthorised absences in a year, etc.) under which an employer may
dismiss **without notice and without EOSB**. This is a statutory exception to Art. 84.

**Problem:** The previous note "استحقاق كامل (100٪) وفق المادة (84)" applied to all
`terminate` selections without acknowledging this exception. A user selecting
"فسخ من صاحب العمل" after an Art. 80 misconduct dismissal could be misled into believing
they receive a full award.

**Fix applied (this PR):** The note for `terminate/retire/mutual/fixed_expired` now reads:
> "استحقاق كامل (100٪) وفق المادة (84) — يسري على الإنهاء الاعتيادي؛ الفصل التأديبي بموجب
> المادة (80) يُسقط المكافأة وخارج نطاق الحاسبة"

Translation: *Full entitlement (100%) per Art. 84 — applies to ordinary termination; disciplinary
dismissal under Art. 80 forfeits the award and is outside the calculator's scope.*

The existing bottom-of-form disclaimer ("تقديرية استرشادية") remains. No formula change
is needed; the calculation itself is correct for the ordinary-termination scenario it models.

**Sources:**
- Legal 500 — Art. 80 framework:
  https://www.legal500.com/intelligence/saudi-arabia/employment-and-hr/saudi-labor-law-articles-80-and-81-the-legal-framework-governing-termination-and-resignation-in-saudi-arabia
- Pinsent Masons — Art. 80 practical risk note:
  https://www.pinsentmasons.com/Out-Law/Analysis/Employment-law-risks-employers-saudi-arabia-overlooking
- RemotePass — Art. 80 misconduct grounds (fraud, assault, 15+ consecutive absent days):
  https://www.remotepass.com/country/saudi-arabia/termination
- Global Law Experts — Art. 80 as limited exception to Art. 84:
  https://globallawexperts.com/wrongful-termination-endofservice-disputes-saudi-arabia/

---

### 2.5 Notice period (Art. 75) — VERIFIED (scope already explicit in UI)

**Rule (post M/44, effective 19 Feb 2025):**
For indefinite-term contracts **where wages are paid monthly**, the required notice is:
- **30 days** when the **employee** initiates termination (resignation)
- **60 days** when the **employer** initiates termination

Non-monthly-paid indefinite contracts (daily, weekly, piece-rate) have different handling
under the implementing regulations; fixed-term contracts have separate rules.

**Code defaults:** `resign → noticeRequired 30`, `terminate → noticeRequired 60`.
Matches the amended law for the supported scope.

**UI scope statement (component line ~653):** The component already reads:
> "المادة (75): للعقد غير المحدد **مع الراتب الشهري** — مهلة الاشعار 30 يوماً..."

The phrase "مع الراتب الشهري" (with monthly salary) explicitly restricts the notice-period
section to monthly-paid workers — the exact scope where Art. 75's 30/60-day rule applies.
This is VERIFIED correct. No UI change needed.

**Sources:**
- Addleshaw Goddard — 2025 KSA Labour Law amendments (30/60-day revision confirmed):
  https://www.addleshawgoddard.com/en/insights/insights-briefings/2025/employment/navigating-new-horizon-understanding-2025-amendments-ksa-labour-law/
- Clyde & Co — Royal Decree M/44, effective 19 Feb 2025:
  https://www.clydeco.com/en/insights/2025/03/ksa-labour-law-amendments-resignations
- SAP knowledge base — Art. 75 notice periods:
  https://userapps.support.sap.com/sap/support/knowledge/en/3532505

---

### 2.6 Notice in lieu (Art. 76) — VERIFIED

**Rule:** The party that fails to give or maintain notice must compensate the other with
wages for the un-served portion.

**Code:** `noticePay = dailyWage * missedDays`, assigned as addition (+) to the worker
or deduction (−) from the worker depending on which party gave notice. Correct.

---

### 2.7 Leave compensation (Art. 111) — VERIFIED (wage base and ÷30 remain UNCERTAIN by statute)

**Rule:** On leaving employment the worker is entitled to full cash compensation for all
unused annual leave days.

**Code:** `leavePay = leaveDays × (leaveBase / divisor)`

**Wage base — UNCERTAIN (convention, not statutory):** Art. 111 says "wage" without specifying
basic-only vs. total. Saudi labour courts predominantly apply the total/actual wage. The
calculator defaults to total wage and offers basic-only as a user-configurable alternative.
This is defensible and transparent.

**Daily divisor — UNCERTAIN (convention, not statutory):** The statute does not fix the
daily-rate divisor. ÷30 is the prevailing Saudi contractual convention. The calculator
offers ÷30 / ÷26 / ÷22. User-configurable, not a defect.

---

### 2.8 Fractional service (Art. 84) — VERIFIED (proration method is convention)

**Rule:** The worker is entitled to EOSB for portions of a year in proportion to time spent.

**Code:** `calcServiceMonths` prorates residual days using the current month's day count.
Residual-day proration is a common convention; the statute prescribes pro-rata entitlement
but not the exact daily-divisor method. No defect.

Regression coverage: `tests/employmentCalculators6D.test.mjs` FIX 3 verifies that
2020-01-01 to 2022-01-25 (24 residual days in a 31-day month) correctly includes the
fractional month.

---

### 2.9 Overtime (Art. 107) — VERIFIED

**Rule:** Overtime rate = actual hourly wage + 50% of **basic** hourly wage (hybrid formula).

**Code** (`OvertimeCalculator.jsx`, cross-verified via audit):
```
const saudiOtRate = actualHourlyWage + 0.5 * basicHourlyWage;
```
Confirmed by golden-scenario test: Basic 6,000 + Allowances 3,000, 10h OT = exactly SAR 500.

**Source:** HRSD article 312:
https://www.hrsd.gov.sa/en/knowledge-centre/articles/312

---

## 3. Summary findings table

| Item | Status | Notes |
|---|---|---|
| EOSB base (Art. 84) | VERIFIED | HRSD 317 / OECD verbatim |
| Resignation taper (Art. 85) | VERIFIED | OECD verbatim; exactly-5y boundary correct |
| Female full award (Art. 87) | VERIFIED | HRSD 317 |
| Termination types — ordinary | VERIFIED | Art. 84; scope note now explicit |
| Art. 80 for-cause dismissal | CORRECTED | Note added; forfeiture disclosed in results sub-text |
| Notice 30/60 days (Art. 75) | VERIFIED | M/44 effective 19 Feb 2025; monthly-paid scope explicit |
| Notice in lieu (Art. 76) | VERIFIED | Formula correct |
| Leave compensation (Art. 111) | VERIFIED | Wage base and ÷30 UNCERTAIN — user-configurable |
| Fractional service | VERIFIED | Proration method UNCERTAIN — standard convention |
| Overtime (Art. 107) | VERIFIED | HRSD 312; golden-scenario regression passes |
| Page footer decree citation | CORRECTED | م/14 → م/44, 8 Safar 1446H / 23 Aug 2024 |
| Effective date | CORRECTED | "18 Feb 2025" → **19 Feb 2025** (HRSD-relayed) |

**Potentially incorrect calculations remaining:** none.
**Code defects remaining:** none.

---

## 4. Arabic SEO audit

| Signal | Status | Notes |
|---|---|---|
| Arabic `<title>` with year + keywords | PASS | "2026 \| مكافأة وإجازة وإشعار" |
| Arabic meta `description` | PASS | Comprehensive; all key terms present |
| Arabic `keywords` array | PASS | Arabic + English (EOSB) terms |
| Canonical URL | PASS | `/ar/sa/final-settlement-calculator` |
| `hreflang` alternates | PASS | `ar-SA` and `ar-AE` |
| OpenGraph (`locale: ar_SA`, OG image) | PASS | |
| JSON-LD: FAQPage / SoftwareApp / BreadcrumbList | PASS | Rich structured data present |
| `dir="rtl"` on `<main>` | PASS | |
| Breadcrumb nav with `aria-current` | PASS | |
| Editorial Arabic content | PASS | Explanation, steps, worked example, legal articles |
| Internal linking to related Saudi tools | PASS | |
| Authority citation + disclaimer + reviewed date | PASS | Links hrsd.gov.sa and ودي platform |
| JSON-LD FAQ answer accuracy | PASS | All 5 Q&A answers verified against law above |
| Impact of Day 4 label change | NONE | "مكافأة نهاية الخدمة المستحقة" is client-rendered UI text, not in metadata or structured data; no SEO regression |
| Impact of Art. 80 note addition | NONE | Sub-text only in component results panel; no metadata change |
| Page footer citation (corrected) | PASS | م/44, 19 Feb 2025 — now accurate |

**SEO conclusion:** The page is well-optimised for Arabic search. All corrections in this PR
(Art. 80 note, decree citation update) are UI sub-text only and introduce no SEO regression.

---

## 5. Staging / Supabase DB-integration test diagnosis

**Failing tests (4):**
1. `adminRoutes.test.js:16` — `fetchLeadsDirect queries Supabase directly`
2. `staging-integration.test.js:70` — Live Session Lifecycle
3. `staging-integration.test.js:97` — Concurrent Atomic Rate Limiting
4. `staging-integration.test.js:117` — Cleanup Function Execution Permissions

**Error message:** all fail with Supabase error `"Unregistered API key"`.

**Root-cause diagnosis (keys inspected for format only — values never read or printed):**

| Check | Expected | Actual |
|---|---|---|
| Project URL present | yes | yes |
| Project ref in URL | valid `ufyhkmrzpynbecapuejd` | matches both env files |
| SERVICE_ROLE_KEY length | 180–220 chars (Supabase JWT) | **41 chars** |
| SUPABASE_ANON_KEY length | 150–220 chars (Supabase JWT) | **69 chars** |
| Keys start with `eyJ` (JWT header) | yes | **no** |
| Keys contain 2 dots (JWT segments) | yes (header.payload.sig) | **0 dots** |

**Conclusion:** The configured keys are **not Supabase JWTs at all**. A Supabase JWT is a
compact three-segment base64url token starting with `eyJ` (base64url of `{"`). The values in
`.env.local` are 41 and 69 characters with no JWT structure — they are wrong-type values
(possibly partial tokens, API keys from a different service, or placeholder strings).

This is **not a key rotation issue** — rotated keys would still be JWT-formatted. The keys
were never valid Supabase JWTs in this environment. The "Unregistered API key" error is
Supabase's response to a token it cannot parse as a valid signed JWT for project
`ufyhkmrzpynbecapuejd`.

**What correct Supabase keys look like (format only, never the values):**
```
SUPABASE_URL=https://ufyhkmrzpynbecapuejd.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.<payload>.<signature>
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.<payload>.<signature>
```

**Action required from project owner (no code change needed):**

1. Open Supabase Dashboard → Project `ufyhkmrzpynbecapuejd`:
   https://supabase.com/dashboard/project/ufyhkmrzpynbecapuejd/settings/api
2. Copy the **Project URL** (should be `https://ufyhkmrzpynbecapuejd.supabase.co`)
3. Copy the **`anon` / `public`** key — it will be a long string starting with `eyJ`
4. Copy the **`service_role` / `secret`** key — also starts with `eyJ`, longer
5. Replace the current values in `.env.local`:
   ```
   SUPABASE_URL=https://ufyhkmrzpynbecapuejd.supabase.co
   SUPABASE_ANON_KEY=<paste eyJ... anon key>
   SUPABASE_SERVICE_ROLE_KEY=<paste eyJ... service_role key>
   ```
6. Run `npm test` — the 4 DB-integration tests should then pass
7. **Do not commit** `.env.local` — it is in `.gitignore`

The staging tests themselves are correct and are not mocked, skipped, or masked.

---

## 6. Security audit

Commands run: `npm audit` (all deps) and `npm audit --omit=dev` (production deps only).

### 6.1 Vulnerability counts

| Scope | Critical | High | Moderate | Low | Total |
|---|---|---|---|---|---|
| `npm audit` (all deps) | 0 | 1 | 4 | 0 | **5** |
| `npm audit --omit=dev` (prod only) | 0 | 1 | 1 | 0 | **2** |

### 6.2 Production-affecting vulnerabilities (`--omit=dev` — 2 total)

These appear in the production dependency tree via `next` (a direct runtime dependency).

#### HIGH — postcss ≤ 8.5.22 (bundled inside `next/node_modules/postcss@8.4.31`)

`next@15.5.27` ships its own internal copy of `postcss@8.4.31`, which falls within the
advisory range `≤8.5.22`. This is a transitive runtime-adjacent vulnerability.

| Advisory | Severity | URL |
|---|---|---|
| PostCSS XSS via unescaped `</style>` in CSS stringify output | moderate | https://github.com/advisories/GHSA-qx2v-qp2m-jg93 |
| PostCSS arbitrary file read via attacker-controlled `sourceMappingURL` | high | https://github.com/advisories/GHSA-6g55-p6wh-862q |
| PostCSS: incomplete fix of GHSA-6g55 — `.map` file disclosure when `from` is unset | moderate | https://github.com/advisories/GHSA-fxqj-rqcc-2cmp |
| PostCSS path traversal via previous source-map auto-loading | high | https://github.com/advisories/GHSA-r28c-9q8g-f849 |

**Dependency path:** `next@15.5.27` → `next/node_modules/postcss@8.4.31`

**Fix available:** upgrade `next` to **16.4.3** (`isSemVerMajor: true` — major version bump,
breaking change, out of this PR's scope).

**Exploitability in this project:** these advisories affect PostCSS when it processes
attacker-controlled CSS input with source-map annotations. In this Next.js app, PostCSS runs
only at build time on the project's own Tailwind CSS. An attacker would need write access to
the source files to exploit the source-map path-traversal advisories in a build context.
**Runtime risk to end users is low**, but the bundled version should be updated when upgrading
to Next.js 16+.

#### MODERATE — next@15.5.27 (downstream of postcss above)

`next` itself is flagged moderate because it depends on the vulnerable postcss version above.
This is a dependent flag, not an independent advisory in next.

**Fix available:** same — upgrade `next` to **16.4.3**.

### 6.3 Development-only vulnerabilities (`npm audit` only — 3 additional, not in `--omit=dev`)

These appear **only** in the build/test tooling and do not ship to production.

#### MODERATE — postcss-selector-parser@6.1.5 (< 7.1.6)

| Advisory | URL |
|---|---|
| Quadratic complexity in flat selector parsing allows CPU exhaustion | https://github.com/advisories/GHSA-rj75-hqrm-r3gf |

**Dependency path:** `tailwindcss@3.4.19` (devDep) → `postcss-nested@6.2.0` →
`postcss-selector-parser@6.1.5` AND `tailwindcss@3.4.19` → `postcss-selector-parser@6.1.5`

This affects CSS processing **at build time only**. Exploitation requires crafting malicious
CSS input fed into the tailwind/postcss pipeline — not a concern in this project's build context
where only the project's own CSS is processed.

**Fix available:** upgrade `tailwindcss` to **4.3.3** (`isSemVerMajor: true` — breaking change
requiring full Tailwind v4 migration, out of scope for this PR).

#### MODERATE — postcss-nested@6.2.0 (2.0.3–6.2.0)

Downstream of `postcss-selector-parser` above. Same fix path (tailwindcss 4.x).
**Dependency path:** `tailwindcss@3.4.19` (devDep) → `postcss-nested@6.2.0`

#### MODERATE — tailwindcss@3.4.19 (flagged range)

Flagged because it depends on the two packages above.
**Dependency path:** direct `devDependency`.

### 6.4 Remediation options

| Vulnerability group | Fix | Blocker? |
|---|---|---|
| postcss HIGH (in next) + next MODERATE | Upgrade `next` 15 → 16.4.3 (major) | Out of scope — separate sprint |
| postcss-selector-parser/postcss-nested/tailwindcss MODERATE | Upgrade `tailwindcss` v3 → v4.3.3 (major) | Out of scope — would require full Tailwind config migration |

`npm audit fix --force` is **NOT applied** — it performs the breaking major upgrades above.
`npm audit fix` (non-breaking) was already applied in the previous commit and resolved the
original critical Next.js RCE (GHSA-2464) and reduced the count from 9 to 5.

### 6.5 Assessment

The 2 production-affecting vulnerabilities are both inside `next`'s own bundled `postcss` copy.
They are exploitable only if attacker-controlled CSS with malicious `sourceMappingURL` comments
is fed through the build pipeline — not a realistic threat vector for this project's normal
build process. They should be addressed when the project upgrades to Next.js 16.

The 3 dev-only vulnerabilities affect only the build-time Tailwind/PostCSS pipeline and have
no runtime exposure to end users.
