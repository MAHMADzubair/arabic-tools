/**
 * lib/toolPageCss.js
 * Shared page styles for Saudi tool pages (the ".fp" layout first used on the final
 * settlement page): theme tokens that follow the site toggle and the OS, article cards,
 * tables, steps, FAQ and link cards. Render once per page: <style>{TOOL_PAGE_CSS}</style>
 */
export const TOOL_PAGE_CSS = `
.fp,.fp .geo{--bg:var(--c-bg,#F5F5F2);--ink:var(--c-ink,#0D0D0D);--ac:var(--c-accent,#FF6A1A);--sf:var(--c-surface,#FFFFFF);--mu:var(--c-muted,#55554F);--ln:var(--c-line,#D9D9D3)}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .fp,:root:not([data-theme="light"]) .fp .geo{--bg:var(--c-bg,#0D0D0D);--ink:var(--c-ink,#F5F5F2);--sf:var(--c-surface,#181816);--mu:var(--c-muted,#B4B4AD);--ln:var(--c-line,#34342F)}}
:root[data-theme="dark"] .fp,:root[data-theme="dark"] .fp .geo{--bg:var(--c-bg,#0D0D0D);--ink:var(--c-ink,#F5F5F2);--sf:var(--c-surface,#181816);--mu:var(--c-muted,#B4B4AD);--ln:var(--c-line,#34342F)}
.fp{background:var(--bg);color:var(--ink);min-height:100vh;font-size:15px;line-height:1.75}
.fp *{box-sizing:border-box}
.fp h2,.fp h3,.fp h4,.fp p,.fp ol{margin:0;padding:0}
.fp-wrap{max-width:48rem;margin:0 auto;padding-inline:16px}
/* globals.css sets overflow-x:hidden on html AND body, which turns body into a scroll
   container and silently disables position:sticky. clip keeps the no-sideways-scroll
   guarantee without that side effect, so the result panel can stay pinned on desktop. */
@media(min-width:960px){.fp-wide{max-width:72rem}body{overflow-x:clip}}
.fp .geo{max-width:48rem;margin-top:8px}
.fp .geo-box{border-width:1px;border-radius:26px;overflow:hidden;font-size:13.5px}
.fp .geo-bar{border-inline-end:0}
.fp .geo-body{padding:18px 20px}
.fp .geo-note{border-top-width:1px}
.fp-quick{border:1px solid var(--ln);border-inline-start:6px solid var(--ac);border-radius:18px;background:var(--bg);padding:14px 18px}
.fp-quick b{display:block;font-size:12.5px;color:var(--mu);margin-bottom:4px}
.fp-quick p{font-size:15px;font-weight:800;line-height:1.9}
.fp-ul{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:10px}
.fp-ul li{display:flex;gap:10px;align-items:flex-start;font-size:14px}
.fp-ul li::before{content:"";flex:none;width:8px;height:8px;margin-top:.62em;border-radius:3px;background:var(--ac)}
.fp-src{margin:8px 0 0;padding:0;list-style:none;display:flex;flex-direction:column;gap:4px}
.fp a{color:inherit}
.fp a:focus-visible,.fp summary:focus-visible{outline:3px solid var(--ink);outline-offset:2px}
.fp-crumb{padding-top:16px;padding-bottom:4px}
.fp-crumb ol{list-style:none;display:flex;flex-wrap:wrap;gap:6px;font-size:13px;color:var(--mu)}
.fp-crumb li+li::before{content:"/";margin-inline-end:6px}
.fp-crumb a{text-decoration:underline;text-underline-offset:3px}
.fp-crumb [aria-current]{color:var(--ink);font-weight:700}
.fp-card{background:var(--sf);border:1px solid var(--ln);border-radius:26px;padding:22px;display:flex;flex-direction:column;gap:24px}
@media(min-width:640px){.fp-card{padding:32px}}
.fp-sec{padding-top:24px}
.fp-h2{font-size:22px;font-weight:800;line-height:1.35;padding-bottom:12px;border-bottom:1px solid var(--ln)}
.fp .fp-h3{font-size:16px;font-weight:800;margin-bottom:12px}
.fp-card>.fp-h2+.fp-p,.fp-card>div>.fp-h2+.fp-p{margin-top:0}
.fp-p{font-size:14.5px}
.fp-p+.fp-p{margin-top:12px}
.fp-steps{list-style:none;display:flex;flex-direction:column;gap:10px;counter-reset:s}
.fp-steps li{display:flex;gap:12px;align-items:flex-start;font-size:14px;counter-increment:s}
.fp-steps li::before{content:counter(s);flex:none;width:28px;height:28px;display:grid;place-items:center;border-radius:10px;color:#0D0D0D;background:linear-gradient(160deg,#FF9B63,#FF6A1A 55%,#EE5A0B);font-weight:800;font-size:13px}
.fp-ex{border:1px solid var(--ln);border-radius:20px;background:var(--bg);padding:20px}
.fp-exr{display:flex;justify-content:space-between;gap:12px;padding:10px 0;border-bottom:1px solid var(--ln);font-size:14px}
.fp-exr small{display:block;font-size:12px;color:var(--mu)}
.fp-exr b{white-space:nowrap}
.fp-net{display:flex;justify-content:space-between;gap:12px;margin-top:12px;padding:12px 16px;border-radius:16px;background:linear-gradient(160deg,#FF9B63,#FF6A1A 55%,#EE5A0B);color:#0D0D0D;font-weight:800;font-size:16px}
.fp-fn{margin-top:12px;font-size:12px;color:var(--mu)}
.fp-tw{overflow-x:auto;border:1px solid var(--ln);border-radius:16px}
.fp-t{width:100%;border-collapse:collapse;font-size:14px}
.fp-t th,.fp-t td{padding:12px 14px;text-align:start;border-bottom:1px solid var(--ln)}
.fp-t tr:last-child td{border-bottom:0}
.fp-t th{background:var(--bg);font-weight:800;white-space:nowrap}
.fp-t td:last-child{white-space:nowrap}
.fp-t td:first-child{min-width:7.5rem}
@media(max-width:560px){
  .fp-ts thead{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}
  .fp-ts tr{display:grid;grid-template-columns:1fr auto;gap:4px 10px;padding:12px 14px;border-bottom:1px solid var(--ln)}
  .fp-ts tr:last-child{border-bottom:0}
  .fp-ts td{padding:0;border:0}
  .fp-ts td:nth-child(2){grid-column:1/-1;grid-row:2;color:var(--mu);font-size:13.5px}
  .fp-ts td:nth-child(3){font-size:12px;font-weight:800;border:1px solid var(--ln);border-radius:8px;padding:0 8px;align-self:start}
}
.fp-g2,.fp-g3{display:grid;gap:12px;grid-template-columns:1fr}
@media(min-width:640px){.fp-g2{grid-template-columns:1fr 1fr}.fp-g3{grid-template-columns:repeat(3,1fr)}}
.fp-art{border:1px solid var(--ln);border-radius:18px;padding:16px;display:flex;flex-direction:column;gap:6px}
.fp-tag{align-self:flex-start;background:var(--ink);color:var(--bg);font-size:12px;font-weight:800;padding:1px 10px;border-radius:8px}
.fp-art b{font-size:14px}
.fp-art p{font-size:13px;color:var(--mu)}
.fp-faq>div{padding:18px 0;border-bottom:1px solid var(--ln)}
.fp-faq>div:first-child{padding-top:0}
.fp-faq>div:last-child{border-bottom:0;padding-bottom:0}
.fp-faq h3{font-size:15px;font-weight:800;margin-bottom:6px}
.fp-faq p{font-size:14px}
.fp-note{border:1px solid var(--ln);border-radius:18px;background:var(--bg);padding:16px 18px;font-size:13.5px}
.fp-chain{border:1px solid var(--ln);border-radius:22px;background:var(--bg);padding:20px}
.fp-chain h2{font-size:18px;font-weight:800}
.fp-chain>p{font-size:13px;color:var(--mu);margin:4px 0 16px}
.fp-lk{display:flex;flex-direction:column;gap:6px;text-decoration:none;background:var(--sf);border:1px solid var(--ln);border-inline-start:6px solid var(--ac);border-radius:16px;padding:14px 16px;min-height:44px}
.fp-lk:hover{background:var(--ink);color:var(--bg)}
.fp-lk:hover p{color:var(--bg)}
.fp-lk h3,.fp-lk .t{font-size:14px;font-weight:800;margin:0;display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.fp-lk p{font-size:12px;color:var(--mu)}
.fp-lk .go{font-size:12px;font-weight:800;text-decoration:underline;text-underline-offset:3px}
.fp-b{border:1px solid currentColor;border-radius:8px;font-size:11px;font-weight:800;padding:0 8px}
.fp-rev{border:1px dashed var(--ln);border-radius:16px;padding:14px 16px;font-size:12px}
.fp-rev a{font-weight:800;text-decoration:underline;text-underline-offset:3px}
.fp-bot{padding-bottom:48px}
@media print{.fp-crumb{display:none}}
`;
