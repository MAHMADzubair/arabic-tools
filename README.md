# Arabic Tools — Starter Project

Next.js 14 (App Router) + Tailwind CSS, RTL-ready, with the Zakat Calculator
already wired up.

## Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## What's included

- `/` — homepage listing all tools
- `/zakat-calculator` — fully working Zakat calculator
- `/loan-calculator` — placeholder, build next
- `/currency-converter` — placeholder, build next
- RTL + Arabic font (IBM Plex Sans Arabic) set globally in `app/layout.js`
- Tailwind configured with a `brand` color you can change in
  `tailwind.config.js`

## Next steps

1. Build out `loan-calculator` and `currency-converter` the same way
   `ZakatCalculator.jsx` is built — a client component in `/components`,
   imported into its route's `page.js`.
2. Deploy to Vercel: push this folder to a GitHub repo, then import it at
   vercel.com — zero config needed, it auto-detects Next.js.
3. Add Google Search Console + submit sitemap once you have 5+ tools live.
4. Add Google AdSense once you have enough content for approval (usually
   8-10 solid pages).
