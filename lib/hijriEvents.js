/**
 * lib/hijriEvents.js — upcoming Ramadan/Eid dates from the Umm al-Qura calendar
 * (Intl "islamic-umalqura"), computed rather than hard-coded so the page stays
 * correct after every deploy. Official start/end still follow the moon sighting.
 */
const DAY = 86400000;
const fmt = new Intl.DateTimeFormat("en-US-u-ca-islamic-umalqura", {
  timeZone: "Asia/Riyadh",
  day: "numeric",
  month: "numeric",
  year: "numeric",
});

export function toHijri(date) {
  const p = Object.fromEntries(fmt.formatToParts(date).map((x) => [x.type, x.value]));
  return { y: Number(p.year), m: Number(p.month), d: Number(p.day) };
}

/** Noon in Riyadh for a given ISO day, so DST/timezone edges never shift the day. */
const noonRiyadh = (date) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 9));

function scan(from, maxDays, test) {
  let t = noonRiyadh(from).getTime();
  for (let i = 0; i <= maxDays; i++, t += DAY) {
    const date = new Date(t);
    const h = toHijri(date);
    if (test(h)) return { date, ...h };
  }
  return null;
}

/**
 * Ramadan of the season around `now`: the current Ramadan while we are in it or
 * in the Eid week after it, otherwise the next one.
 */
export function ramadanSeason(now = new Date()) {
  const start = scan(new Date(now.getTime() - 40 * DAY), 420, (h) => h.m === 9 && h.d === 1);
  if (!start) return null;
  const at = (m, d, max = 120) => scan(start.date, max, (h) => h.y === start.y && h.m === m && h.d === d)?.date ?? null;
  const shawwal1 = at(10, 1);
  const event = {
    hijriYear: start.y,
    ramadanStart: start.date,
    laylat27: at(9, 27),
    eidFitr: shawwal1,
    arafah: at(12, 9, 140),
    eidAdha: at(12, 10, 140),
  };
  // Once the Eid week is over, move to next year's Ramadan.
  if (shawwal1 && now.getTime() > shawwal1.getTime() + 7 * DAY) {
    return ramadanSeason(new Date(shawwal1.getTime() + 60 * DAY));
  }
  return event;
}

export function daysUntil(target, now = new Date()) {
  return Math.round((noonRiyadh(target).getTime() - noonRiyadh(now).getTime()) / DAY);
}

const AR_DATE = new Intl.DateTimeFormat("ar-SA-u-ca-gregory-nu-latn", { timeZone: "Asia/Riyadh", weekday: "long", day: "numeric", month: "long", year: "numeric" });
export const formatGregorianAr = (d) => AR_DATE.format(d);
