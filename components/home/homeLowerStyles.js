// Styles for the homepage lower sections (Why Qemlo, tools directory,
// official sources, FAQ). Plain CSS scoped under `.hl`, rendered once by
// HomeSeoSections. Theme follows the site tokens (--bg, --surface, --text…).
export const HOME_LOWER_CSS = `
.hl{--hl-accent:#C2410C;--hl-tint:#FFF1E8;--hl-line:#E2E2DC;--hl-line-2:#D4D4CE;--hl-ink:#0D0D0D}
:root[data-theme="dark"] .hl{--hl-accent:#FF8A4C;--hl-tint:rgba(255,91,4,.10);--hl-line:#262626;--hl-line-2:#2F2F2F;--hl-ink:#161616}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .hl{--hl-accent:#FF8A4C;--hl-tint:rgba(255,91,4,.10);--hl-line:#262626;--hl-line-2:#2F2F2F;--hl-ink:#161616}}

.hl-wrap{max-width:1080px;margin:0 auto;padding:0 20px}
.hl-eyebrow{display:inline-flex;align-items:center;gap:8px;font-size:12px;font-weight:700;color:var(--hl-accent)}
.hl-eyebrow::before{content:"";width:18px;height:2px;border-radius:2px;background:var(--orange)}
.hl-h2{font-size:28px;line-height:1.3;font-weight:800;margin-top:10px;color:var(--text)}
.hl-lead{font-size:16px;line-height:1.9;color:var(--text-2);margin-top:12px}
.hl-lead strong{color:var(--text);font-weight:700}
.hl-sec{padding:56px 0}
.hl-br{display:none}
@media(min-width:900px){.hl-sec{padding:88px 0}.hl-h2{font-size:38px}.hl-lead{font-size:18px}.hl-br{display:inline}}

/* Why Qemlo — ink band (dark in both themes) */
.hl-why{background:var(--hl-ink);color:#F5F5F2;border-radius:28px;margin:0 12px;padding:44px 0;position:relative;overflow:hidden}
:root[data-theme="dark"] .hl-why{border:1px solid var(--hl-line)}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .hl-why{border:1px solid var(--hl-line)}}
.hl-why::after{content:"";position:absolute;bottom:-140px;left:-140px;width:340px;height:340px;border-radius:50%;background:radial-gradient(closest-side,rgba(255,91,4,.28),transparent);pointer-events:none}
.hl-why .hl-eyebrow{color:#FF8A4C}
.hl-why .hl-h2{color:#FFFFFF}
.hl-why .hl-lead{color:#B5B5B0}
.hl-why-head{display:grid;gap:20px;position:relative;z-index:1}
.hl-stats{display:grid;grid-template-columns:repeat(3,1fr);margin:8px 0 0;padding:0;list-style:none;border-top:1px solid rgba(255,255,255,.12);border-bottom:1px solid rgba(255,255,255,.12)}
.hl-stat{padding:18px 4px;text-align:center}
.hl-stat+.hl-stat{border-inline-start:1px solid rgba(255,255,255,.12)}
.hl-stat b{display:block;font-size:26px;font-weight:800;color:#fff;font-variant-numeric:tabular-nums}
.hl-stat span{font-size:12px;color:#B5B5B0}
.hl-feats{display:grid;margin:8px 0 0;padding:0;list-style:none;position:relative;z-index:1}
.hl-feat{display:flex;gap:16px;align-items:flex-start;padding:22px 0;border-bottom:1px solid rgba(255,255,255,.10)}
.hl-feat:last-child{border-bottom:0}
.hl-feat-ic{flex:none;width:44px;height:44px;border-radius:14px;display:grid;place-items:center;background:rgba(255,91,4,.14);color:#FF8A4C;border:1px solid rgba(255,91,4,.28)}
.hl-feat h3{font-size:17px;font-weight:700;color:#fff}
.hl-feat p{font-size:14px;line-height:1.8;color:#B5B5B0;margin-top:4px}
@media(min-width:900px){
  .hl-why{margin:0 auto;max-width:1160px;padding:72px 0;border-radius:36px}
  .hl-why-head{grid-template-columns:1.1fr .9fr;align-items:end;gap:48px}
  .hl-stats{margin-top:0}
  .hl-feats{grid-template-columns:repeat(3,1fr);margin-top:48px;border-top:1px solid rgba(255,255,255,.12)}
  .hl-feat{flex-direction:column;padding:32px 28px 8px;border-bottom:0}
  .hl-feat+.hl-feat{border-inline-start:1px solid rgba(255,255,255,.12)}
  .hl-feat:first-child{padding-inline-start:0}
  .hl-feat h3{font-size:19px}
}

/* Tools directory */
.hl-intro{max-width:760px}
.hl-groups{display:grid;gap:16px;margin-top:32px}
.hl-group{background:var(--surface);border:1px solid var(--hl-line);border-radius:22px;overflow:hidden;transition:border-color .2s,box-shadow .2s}
.hl-group:hover{border-color:var(--hl-line-2);box-shadow:0 12px 32px -18px rgba(0,0,0,.25)}
.hl-g-head{display:flex;align-items:center;gap:12px;padding:18px 20px;border-bottom:1px solid var(--hl-line)}
.hl-g-head>div{min-width:0}
.hl-flag{flex:none;width:40px;height:40px;border-radius:12px;display:grid;place-items:center;background:var(--bg);font-size:20px;border:1px solid var(--hl-line)}
.hl-g-head h3{font-size:17px;font-weight:800;color:var(--text)}
.hl-g-head small{display:block;font-size:12px;color:var(--text-3);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hl-g-all{flex:none;white-space:nowrap;margin-inline-start:auto;font-size:12px;font-weight:700;color:var(--hl-accent);padding:6px 10px;border-radius:999px;background:var(--hl-tint)}
.hl-g-all:hover{background:var(--orange);color:#0D0D0D}
.hl-list{margin:0;padding:0;list-style:none}
.hl-list a{display:flex;align-items:center;gap:10px;min-height:48px;padding:12px 20px;font-size:14.5px;font-weight:500;color:var(--text);border-bottom:1px solid var(--hl-line);transition:background .15s,color .15s}
.hl-list li:last-child a{border-bottom:0}
.hl-list a:hover{background:var(--hl-tint);color:var(--hl-accent)}
.hl-list .hl-t{flex:1;line-height:1.5}
.hl-list .hl-t em{font-style:normal;color:var(--text-3);font-size:12.5px}
.hl-arr{flex:none;color:var(--text-3);transition:transform .15s,color .15s}
.hl-list a:hover .hl-arr{transform:translateX(-3px);color:var(--hl-accent)}
@media(min-width:900px){.hl-groups{grid-template-columns:repeat(3,1fr);gap:20px;margin-top:44px}}

/* Official sources */
.hl-trust{margin-top:20px;border-radius:22px;background:var(--surface);border:1px solid var(--hl-line);padding:22px 20px;display:grid;gap:16px}
.hl-trust-h{display:flex;gap:12px;align-items:center}
.hl-shield{flex:none;width:40px;height:40px;border-radius:12px;display:grid;place-items:center;background:var(--hl-tint);color:var(--hl-accent)}
.hl-trust-h h3{font-size:16px;font-weight:800;color:var(--text)}
.hl-trust-h p{font-size:12.5px;color:var(--text-3);margin-top:2px}
.hl-chips{display:flex;flex-wrap:wrap;gap:8px;margin:0;padding:0;list-style:none}
.hl-chip{display:inline-flex;align-items:center;gap:8px;padding:8px 12px;border-radius:12px;border:1px solid var(--hl-line);background:var(--bg);font-size:13px;font-weight:600;color:var(--text);transition:border-color .15s}
.hl-chip:hover{border-color:var(--orange)}
.hl-chip-d{font-size:11px;font-weight:500;color:var(--text-3);direction:ltr;unicode-bidi:isolate}
.hl-disc{font-size:12px;line-height:1.8;color:var(--text-3);border-top:1px dashed var(--hl-line-2);padding-top:14px}
@media(min-width:900px){.hl-trust{grid-template-columns:300px 1fr;align-items:center;padding:26px 28px;column-gap:32px}.hl-disc{grid-column:1/-1}}

/* FAQ */
.hl-faq-grid{display:grid;gap:24px}
.hl-faq-side p{font-size:15px;line-height:1.8;color:var(--text-2);margin-top:12px}
.hl-faq-cta{display:inline-flex;align-items:center;gap:8px;margin-top:20px;font-size:14px;font-weight:700;padding:11px 18px;border-radius:999px;background:var(--text);color:var(--bg)}
.hl-faq-cta:hover{background:var(--orange);color:#0D0D0D}
.hl-faq-list{background:var(--surface);border:1px solid var(--hl-line);border-radius:22px;overflow:hidden}
.hl-faq-list details{border-bottom:1px solid var(--hl-line)}
.hl-faq-list details:last-child{border-bottom:0}
.hl-faq-list summary{list-style:none;display:flex;align-items:center;gap:14px;padding:18px 20px;cursor:pointer;font-weight:700;font-size:15px;line-height:1.6;color:var(--text)}
.hl-faq-list summary::-webkit-details-marker{display:none}
.hl-n{flex:none;font-size:12px;font-weight:700;color:var(--text-3);font-variant-numeric:tabular-nums;width:22px}
.hl-q{flex:1}
.hl-pm{flex:none;width:30px;height:30px;border-radius:50%;border:1px solid var(--hl-line-2);display:grid;place-items:center;color:var(--hl-accent);transition:transform .25s,background .2s}
.hl-faq-list details[open] .hl-pm{transform:rotate(45deg);background:var(--orange);color:#0D0D0D;border-color:var(--orange)}
.hl-faq-list details[open] summary{color:var(--hl-accent)}
.hl-a{padding:0 56px 20px 20px;font-size:14px;line-height:1.9;color:var(--text-2)}
@media(min-width:900px){.hl-faq-grid{grid-template-columns:340px 1fr;gap:56px}.hl-faq-side{position:sticky;top:calc(var(--hd-h,72px) + 24px);align-self:start}.hl-faq-list summary{padding:22px 28px;font-size:16px}.hl-a{padding:0 64px 24px 28px;font-size:15px}}
@media (prefers-reduced-motion:reduce){.hl *{transition:none!important}}
`;
