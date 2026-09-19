"use client";

import { useState, useMemo } from "react";

const COUNTRIES = [
  { id: "pk", name: "???? ???????", currency: "PKR", symbol: "?", flight: 85000, visa: 15000, dailyFood: 2500, transport: 1200, shopping: 20000 },
  { id: "eg", name: "???? ???", currency: "EGP", symbol: "?.?", flight: 12000, visa: 3000, dailyFood: 450, transport: 200, shopping: 4000 },
  { id: "sa", name: "???? ????????", currency: "SAR", symbol: "?.?", flight: 800, visa: 0, dailyFood: 120, transport: 60, shopping: 1000 },
  { id: "ae", name: "???? ????????", currency: "AED", symbol: "?.?", flight: 1800, visa: 320, dailyFood: 300, transport: 120, shopping: 2000 },
  { id: "gb", name: "???? ??????? ???????", currency: "GBP", symbol: "£", flight: 650, visa: 150, dailyFood: 80, transport: 35, shopping: 400 },
  { id: "us", name: "???? ???????? ???????", currency: "USD", symbol: "$", flight: 1100, visa: 150, dailyFood: 100, transport: 40, shopping: 500 },
  { id: "my", name: "???? ???????", currency: "MYR", symbol: "RM", flight: 3800, visa: 600, dailyFood: 350, transport: 150, shopping: 2000 },
  { id: "bd", name: "???? ????????", currency: "BDT", symbol: "?", flight: 55000, visa: 15000, dailyFood: 2000, transport: 800, shopping: 15000 },
];

const SEASONS = [
  { id: "regular", name: "???? (???? ???????)", flightMult: 1, hotelMult: 1 },
  { id: "ramadan", name: "?? ?????", flightMult: 2.2, hotelMult: 3.5 },
  { id: "dhul_hijja", name: "?? ?? ????? (??? ????)", flightMult: 1.6, hotelMult: 2.2 },
  { id: "last_10", name: "?? ????? ??????? (?????)", flightMult: 3.0, hotelMult: 5.0 },
];

const HOTELS = [
  { id: "budget", name: "?? ??????? / ???", sarPerNight: 150, desc: "??? ?????? ?? ????? ?? ?????" },
  { id: "3star", name: "??? ???? 3 ????", sarPerNight: 350, desc: "???? ?? ????? (???? ?? 2 ??)" },
  { id: "4star", name: "???? ???? 4 ????", sarPerNight: 750, desc: "????? ??????? (500? – 2??)" },
  { id: "5star", name: "????? ???? 5 ????", sarPerNight: 1800, desc: "???? ???? (??? ?? 500?)" },
];

const MEAL_PLANS = [
  { id: "self", name: "?? ????? ????", mult: 1 },
  { id: "half", name: "?? ??? ?????", mult: 1.5 },
  { id: "full", name: "?? ????? ?????", mult: 2.0 },
];

const SAR_TO = { pk: 75, eg: 13, sa: 1, ae: 1.02, gb: 0.21, us: 0.27, my: 1.26, bd: 32 };

function fmt(num, symbol) {
  return `${symbol} ${Math.round(num).toLocaleString("ar-EG")}`;
}

export default function UmrahCalculator() {
  const [countryId, setCountryId] = useState("pk");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [days, setDays] = useState(10);
  const [seasonId, setSeasonId] = useState("regular");
  const [hotelId, setHotelId] = useState("4star");
  const [mealId, setMealId] = useState("self");
  const [flightClass, setFlightClass] = useState("economy");
  const [includeVisa, setIncludeVisa] = useState(true);
  const [extraShopping, setExtraShopping] = useState(0);

  const country = COUNTRIES.find((c) => c.id === countryId);
  const season = SEASONS.find((s) => s.id === seasonId);
  const hotel = HOTELS.find((h) => h.id === hotelId);
  const meal = MEAL_PLANS.find((m) => m.id === mealId);
  const sarRate = SAR_TO[countryId] || 1;
  const travelers = adults + children;

  const result = useMemo(() => {
    if (!country || !season || !hotel || !meal) return null;
    const baseFlight = country.flight * season.flightMult;
    const flightCost = baseFlight * (flightClass === "business" ? 3.5 : 1) * travelers;
    const visaCost = includeVisa ? country.visa * travelers : 0;
    const hotelSAR = hotel.sarPerNight * season.hotelMult * days;
    const hotelCost = hotelSAR * sarRate * Math.ceil(travelers / 2);
    const foodCost = country.dailyFood * meal.mult * days * travelers;
    const transportCost = country.transport * days * travelers;
    const shoppingCost = country.shopping + Number(extraShopping);
    const total = flightCost + visaCost + hotelCost + foodCost + transportCost + shoppingCost;
    return { flight: flightCost, visa: visaCost, hotel: hotelCost, food: foodCost, transport: transportCost, shopping: shoppingCost, total, perPerson: total / travelers };
  }, [country, season, hotel, meal, adults, children, days, flightClass, includeVisa, extraShopping, sarRate, travelers]);

  const sym = country?.symbol || "";
  const items = result ? [
    { label: "?? ????? ???????", value: result.flight },
    { label: "?? ???? ????????", value: result.visa },
    { label: "?? ??????? ????????", value: result.hotel },
    { label: "?? ?????? ????????", value: result.food },
    { label: "?? ????????? ????????", value: result.transport },
    { label: "?? ?????? ????????", value: result.shopping },
  ] : [];

  const Counter = ({ value, setValue, min = 0 }) => (
    <div className="flex items-center gap-1">
      <button type="button" onClick={() => setValue(Math.max(min, value - 1))} className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand-border bg-white text-brand font-bold hover:bg-brand-light">-</button>
      <span className="w-8 text-center text-base font-extrabold text-ink">{value}</span>
      <button type="button" onClick={() => setValue(value + 1)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-brand-border bg-white text-brand font-bold hover:bg-brand-light">+</button>
    </div>
  );

  const SelectGrid = ({ items: opts, selected, onSelect, cols = 4 }) => (
    <div className={`grid gap-2 grid-cols-2 sm:grid-cols-${cols}`}>
      {opts.map((o) => (
        <button key={o.id} type="button" onClick={() => onSelect(o.id)}
          className={`rounded-xl border p-2.5 text-xs font-semibold text-right transition-all ${selected === o.id ? "border-brand bg-brand-light text-brand-dark shadow-sm" : "border-brand-border bg-brand-surface/40 text-ink-secondary hover:border-brand-200 hover:bg-white"}`}>
          <span>{o.name}</span>
          {o.desc && <span className="block text-[10px] font-normal opacity-70 mt-0.5">{o.desc}</span>}
          {o.hotelMult && o.id !== "regular" && (
            <span className="block text-[10px] font-normal opacity-70 mt-0.5">???? ×{o.hotelMult} · ????? ×{o.flightMult}</span>
          )}
        </button>
      ))}
    </div>
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12" dir="rtl">
      <div className="mb-8 text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-brand-light px-4 py-1.5 text-sm font-bold text-brand-dark">
          <span>??</span><span>????? ????? ??????</span>
        </div>
        <h1 className="text-3xl font-extrabold text-ink sm:text-4xl">????? ????? ?????? ???????</h1>
        <p className="mx-auto max-w-xl text-sm text-ink-secondary sm:text-base">
          ???? ????? ????? ???????? ???? — ????? ???????? ??????? ??????? ????????? ????????? ??????.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-5">
          {/* Country */}
          <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-4">
            <h2 className="flex items-center gap-2 text-base font-bold text-ink"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-light text-sm">??</span>??? ????????</h2>
            <SelectGrid items={COUNTRIES} selected={countryId} onSelect={setCountryId} cols={4} />
          </div>

          {/* Travelers & Days */}
          <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-4">
            <h2 className="flex items-center gap-2 text-base font-bold text-ink"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-light text-sm">??</span>????????? ???? ???????</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5"><label className="text-xs font-semibold text-ink-secondary">????????</label><Counter value={adults} setValue={setAdults} min={1} /></div>
              <div className="space-y-1.5"><label className="text-xs font-semibold text-ink-secondary">???????</label><Counter value={children} setValue={setChildren} min={0} /></div>
              <div className="space-y-1.5"><label className="text-xs font-semibold text-ink-secondary">???? ???????</label><Counter value={days} setValue={setDays} min={3} /></div>
            </div>
          </div>

          {/* Season */}
          <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-3">
            <h2 className="flex items-center gap-2 text-base font-bold text-ink"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-light text-sm">??</span>???? ?????</h2>
            <SelectGrid items={SEASONS} selected={seasonId} onSelect={setSeasonId} cols={2} />
          </div>

          {/* Hotel */}
          <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-3">
            <h2 className="flex items-center gap-2 text-base font-bold text-ink"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-light text-sm">??</span>??? ??????</h2>
            <SelectGrid items={HOTELS} selected={hotelId} onSelect={setHotelId} cols={2} />
          </div>

          {/* Flight & Meal */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-3">
              <h2 className="text-sm font-bold text-ink">?? ???? ???????</h2>
              <div className="space-y-2">
                {[{ id: "economy", label: "?? ????????" }, { id: "business", label: "?? ???? ????? (×???)" }].map((f) => (
                  <button key={f.id} type="button" onClick={() => setFlightClass(f.id)}
                    className={`w-full rounded-xl border p-2.5 text-xs font-semibold text-right transition-all ${flightClass === f.id ? "border-brand bg-brand-light text-brand-dark" : "border-brand-border bg-brand-surface/40 text-ink-secondary hover:bg-white"}`}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-3">
              <h2 className="text-sm font-bold text-ink">?? ??? ???????</h2>
              <div className="space-y-2">
                {MEAL_PLANS.map((m) => (
                  <button key={m.id} type="button" onClick={() => setMealId(m.id)}
                    className={`w-full rounded-xl border p-2.5 text-xs font-semibold text-right transition-all ${mealId === m.id ? "border-brand bg-brand-light text-brand-dark" : "border-brand-border bg-brand-surface/40 text-ink-secondary hover:bg-white"}`}>
                    {m.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Extra options */}
          <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-4">
            <h2 className="flex items-center gap-2 text-base font-bold text-ink"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-light text-sm">??</span>?????? ??????</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-ink">????? ???? ????????</p>
                <p className="text-xs text-ink-muted">{fmt((country?.visa || 0) * travelers, sym)} ???????</p>
              </div>
              <button type="button" onClick={() => setIncludeVisa(!includeVisa)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${includeVisa ? "bg-brand" : "bg-gray-200"}`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${includeVisa ? "-translate-x-6" : "-translate-x-1"}`} />
              </button>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-ink">?? ??????? ?????? ?????? ({sym})</label>
              <input type="number" min="0" value={extraShopping} onChange={(e) => setExtraShopping(e.target.value)} placeholder="0"
                className="w-full rounded-xl border border-brand-border bg-brand-surface/40 px-4 py-2.5 text-sm font-semibold text-ink focus:border-brand focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/20" />
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-2 space-y-4">
          <div className="sticky top-24 space-y-4">
            <div className="rounded-2xl bg-hero-gradient p-6 text-white shadow-lg space-y-2">
              <p className="text-sm font-medium opacity-80">??????? ????????? ???????</p>
              <p className="text-4xl font-extrabold tracking-tight">{result ? fmt(result.total, sym) : "—"}</p>
              <p className="text-xs opacity-70">?????? ????? ({travelers} ????? · {days} ???)</p>
              {result && (
                <div className="mt-3 rounded-xl bg-white/15 p-3 backdrop-blur-sm">
                  <p className="text-xs opacity-80">??????? ????? ??????</p>
                  <p className="text-2xl font-bold">{fmt(result.perPerson, sym)}</p>
                </div>
              )}
            </div>

            {result && (
              <div className="rounded-2xl border border-brand-border bg-white p-5 shadow-card space-y-3">
                <h3 className="text-sm font-bold text-ink">????? ????????</h3>
                <div className="space-y-2.5">
                  {items.map((item) => {
                    const pct = Math.round((item.value / result.total) * 100);
                    return (
                      <div key={item.label} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-ink-secondary">{item.label}</span>
                          <span className="font-bold text-ink">{fmt(item.value, sym)}</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-brand-surface">
                          <div className="h-full rounded-full bg-brand transition-all duration-500" style={{ width: `${pct}%` }} />
                        </div>
                        <p className="text-[10px] text-ink-muted">{pct}% ?? ????????</p>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-xs text-amber-900 space-y-1 leading-relaxed">
                  <p className="font-bold flex items-center gap-1"><span>??</span> ????? ?????</p>
                  {seasonId === "last_10" && <p>• ????? ??????? ?? ?????? — ????? ?????? ???? ??? ??%</p>}
                  {seasonId === "ramadan" && <p>• ?????: ???? ?????? ??? ? ???? ??? ?????</p>}
                  {hotelId === "5star" && <p>• ????? ? ???? ????? ?? ???? ??% ?? ????? ???????</p>}
                  <p>• ????? ??????? ??? ???????? ????????? ???? ?????</p>
                  <p>• ??????? ?? ??????? ?????? ???? ?????</p>
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-brand-border bg-white p-4 text-center space-y-1">
              <p className="text-xs text-ink-muted">?????? ???????</p>
              <p className="text-base font-bold text-ink">{season?.name}</p>
              {season?.id !== "regular" && <p className="text-xs text-brand">×{season.hotelMult} ??? ????? ???????</p>}
            </div>
          </div>
        </div>
      </div>
      <p className="mt-8 text-center text-xs text-ink-muted">?? ??? ?????? ??????? ????????? ???. ?????? ??????? ??????? ???? ??????? ???????? ?????? ???????.</p>
    </div>
  );
}
