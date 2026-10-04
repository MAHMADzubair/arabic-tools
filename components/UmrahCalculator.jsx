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




function UmrahStyles() {
  return (
    <style>{`
      .uc-root{
        --uc-bg:#F5F5F2;
        --uc-surface:#FFFFFF;
        --uc-surface-2:#ECECE7;
        --uc-border:#D4D4CE;
        --uc-text:#0D0D0D;
        --uc-text-2:#555555;
        --uc-muted:#6B6B66;
        --uc-ink:#0D0D0D;
        --uc-ink-text:#FFFFFF;
        --uc-ink-muted:#B5B5B0;
        --uc-orange:#FF5B04;
        --uc-orange-hover:#FF7A33;
        --uc-orange-press:#E64F00;
        --uc-on-orange:#0D0D0D;
        --uc-success:#137A47;
        --uc-warning:#8A5A00;
        --uc-error:#C8321F;
      }

      @media (prefers-color-scheme:dark){
        :root:not([data-theme="light"]) .uc-root{
          --uc-bg:#0D0D0D;
          --uc-surface:#161616;
          --uc-surface-2:#1D1D1D;
          --uc-border:#2A2A2A;
          --uc-text:#F5F5F2;
          --uc-text-2:#B5B5B0;
          --uc-muted:#8E8E89;
          --uc-ink:#F5F5F2;
          --uc-ink-text:#0D0D0D;
          --uc-ink-muted:#555555;
          --uc-success:#4ADE80;
          --uc-warning:#FBBF24;
          --uc-error:#FF7A6B;
        }
      }

      :root[data-theme="dark"] .uc-root{
        --uc-bg:#0D0D0D;
        --uc-surface:#161616;
        --uc-surface-2:#1D1D1D;
        --uc-border:#2A2A2A;
        --uc-text:#F5F5F2;
        --uc-text-2:#B5B5B0;
        --uc-muted:#8E8E89;
        --uc-ink:#F5F5F2;
        --uc-ink-text:#0D0D0D;
        --uc-ink-muted:#555555;
        --uc-success:#4ADE80;
        --uc-warning:#FBBF24;
        --uc-error:#FF7A6B;
      }

      .uc-root{color:var(--uc-text)}
      .uc-root :focus-visible{
        outline:2px solid var(--uc-orange);
        outline-offset:3px;
      }
      .uc-card{
        background:var(--uc-surface);
        border:1px solid var(--uc-border);
      }
      .uc-step{
        display:inline-flex;
        align-items:center;
        justify-content:center;
        width:28px;
        height:28px;
        border-radius:8px;
        background:var(--uc-orange);
        color:var(--uc-on-orange);
        font-size:.75rem;
        font-weight:900;
        flex:none;
      }
      .uc-selected{
        border-color:var(--uc-orange)!important;
        background:var(--uc-orange)!important;
        color:var(--uc-on-orange)!important;
      }
      .uc-counter{
        border:1px solid var(--uc-border);
        background:var(--uc-surface);
        color:var(--uc-orange);
      }
      .uc-counter:hover{
        border-color:var(--uc-orange);
        background:var(--uc-surface-2);
      }
      .uc-input{
        border:1px solid var(--uc-border);
        background:var(--uc-surface-2);
        color:var(--uc-text);
      }
      .uc-input:focus{
        border-color:var(--uc-orange);
        background:var(--uc-surface);
        box-shadow:0 0 0 3px color-mix(in srgb,var(--uc-orange) 14%,transparent);
        outline:none;
      }
      .uc-result{
        position:relative;
        overflow:hidden;
        border:1px solid var(--uc-border);
        background:var(--uc-ink);
        color:var(--uc-ink-text);
      }
      .uc-result::after{
        content:"";
        position:absolute;
        inset-inline-end:-40px;
        top:-40px;
        width:150px;
        height:150px;
        border:28px solid var(--uc-orange);
        border-radius:999px;
        opacity:.12;
        pointer-events:none;
      }
      .uc-result-sub{
        background:color-mix(in srgb,var(--uc-ink-text) 10%,transparent);
      }
      .uc-bar{
        background:var(--uc-surface-2);
      }
      .uc-bar-fill{
        background:var(--uc-orange);
      }
      .uc-warning{
        background:color-mix(in srgb,var(--uc-warning) 8%,var(--uc-surface));
        border-color:color-mix(in srgb,var(--uc-warning) 35%,var(--uc-border));
        color:var(--uc-warning);
      }
    `}</style>
  );
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

    const baseFlight = country.flight \* season.flightMult;

    const flightCost = baseFlight \* (flightClass === "business" ? 3.5 : 1) \* travelers;

    const visaCost = includeVisa ? country.visa \* travelers : 0;

    const hotelSAR = hotel.sarPerNight \* season.hotelMult \* days;

    const hotelCost = hotelSAR \* sarRate \* Math.ceil(travelers / 2);

    const foodCost = country.dailyFood \* meal.mult \* days \* travelers;

    const transportCost = country.transport \* days \* travelers;

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

      <button type="button" onClick={() => setValue(Math.max(min, value - 1))} className="uc-counter flex h-8 w-8 items-center justify-center rounded-lg font-bold transition-colors">-</button>

      <span className="w-8 text-center text-base font-extrabold text-[var(--uc-text)]">{value}</span>

      <button type="button" onClick={() => setValue(value + 1)} className="uc-counter flex h-8 w-8 items-center justify-center rounded-lg font-bold transition-colors">+</button>

    </div>

  );



  const SelectGrid = ({ items: opts, selected, onSelect, cols = 4 }) => (

    <div className={`grid gap-2 grid-cols-2 sm:grid-cols-${cols}`}>

      {opts.map((o) => (

        <button key={o.id} type="button" onClick={() => onSelect(o.id)}

          className={`rounded-xl border p-2.5 text-xs font-semibold text-right transition-all ${selected === o.id ? "border-brand bg-[var(--uc-orange)] text-[var(--uc-on-orange)] " : "border-[var(--uc-border)] bg-[var(--uc-surface-2)] text-[var(--uc-text-2)] hover:border-[var(--uc-orange)] hover:bg-[var(--uc-surface)]"}`}>

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

    <div className="uc-root mx-auto max-w-5xl px-4 py-8 sm:py-12" dir="rtl">
      <UmrahStyles />

      <div className="mb-8 text-center space-y-3">

        <div className="inline-flex items-center gap-2 rounded-full border border-[var(--uc-orange)] bg-[var(--uc-orange)] px-4 py-1.5 text-sm font-black text-[var(--uc-on-orange)]"><span>????? ????? ??????</span>

        </div>

        <h1 className="text-3xl font-extrabold text-[var(--uc-text)] sm:text-4xl">????? ????? ?????? ???????</h1>

        <p className="mx-auto max-w-xl text-sm text-[var(--uc-text-2)] sm:text-base">

          ???? ????? ????? ???????? ???? — ????? ???????? ??????? ??????? ????????? ????????? ??????.

        </p>

      </div>



      <div className="grid gap-6 lg:grid-cols-5">

        <div className="lg:col-span-3 space-y-5">

          {/\* Country \*/}

          <div className="uc-card rounded-2xl p-5 space-y-4">

            <h2 className="flex items-center gap-2 text-base font-bold text-[var(--uc-text)]"><span className="uc-step" aria-hidden="true">•</span>??? ????????</h2>

            <SelectGrid items={COUNTRIES} selected={countryId} onSelect={setCountryId} cols={4} />

          </div>



          {/\* Travelers & Days \*/}

          <div className="uc-card rounded-2xl p-5 space-y-4">

            <h2 className="flex items-center gap-2 text-base font-bold text-[var(--uc-text)]"><span className="uc-step" aria-hidden="true">•</span>????????? ???? ???????</h2>

            <div className="grid grid-cols-3 gap-4">

              <div className="space-y-1.5"><label className="text-xs font-semibold text-[var(--uc-text-2)]">????????</label><Counter value={adults} setValue={setAdults} min={1} /></div>

              <div className="space-y-1.5"><label className="text-xs font-semibold text-[var(--uc-text-2)]">???????</label><Counter value={children} setValue={setChildren} min={0} /></div>

              <div className="space-y-1.5"><label className="text-xs font-semibold text-[var(--uc-text-2)]">???? ???????</label><Counter value={days} setValue={setDays} min={3} /></div>

            </div>

          </div>



          {/\* Season \*/}

          <div className="uc-card rounded-2xl p-5 space-y-3">

            <h2 className="flex items-center gap-2 text-base font-bold text-[var(--uc-text)]"><span className="uc-step" aria-hidden="true">•</span>???? ?????</h2>

            <SelectGrid items={SEASONS} selected={seasonId} onSelect={setSeasonId} cols={2} />

          </div>



          {/\* Hotel \*/}

          <div className="uc-card rounded-2xl p-5 space-y-3">

            <h2 className="flex items-center gap-2 text-base font-bold text-[var(--uc-text)]"><span className="uc-step" aria-hidden="true">•</span>??? ??????</h2>

            <SelectGrid items={HOTELS} selected={hotelId} onSelect={setHotelId} cols={2} />

          </div>



          {/\* Flight & Meal \*/}

          <div className="grid grid-cols-2 gap-4">

            <div className="uc-card rounded-2xl p-5 space-y-3">

              <h2 className="text-sm font-bold text-[var(--uc-text)]">?? ???? ???????</h2>

              <div className="space-y-2">

                {[{ id: "economy", label: "?? ????????" }, { id: "business", label: "?? ???? ????? (×???)" }].map((f) => (

                  <button key={f.id} type="button" onClick={() => setFlightClass(f.id)}

                    className={`w-full rounded-xl border p-2.5 text-xs font-semibold text-right transition-all ${flightClass === f.id ? "border-brand bg-[var(--uc-orange)] text-[var(--uc-on-orange)]" : "border-[var(--uc-border)] bg-[var(--uc-surface-2)] text-[var(--uc-text-2)] hover:bg-[var(--uc-surface)]"}`}>

                    {f.label}

                  </button>

                ))}

              </div>

            </div>

            <div className="uc-card rounded-2xl p-5 space-y-3">

              <h2 className="text-sm font-bold text-[var(--uc-text)]">?? ??? ???????</h2>

              <div className="space-y-2">

                {MEAL_PLANS.map((m) => (

                  <button key={m.id} type="button" onClick={() => setMealId(m.id)}

                    className={`w-full rounded-xl border p-2.5 text-xs font-semibold text-right transition-all ${mealId === m.id ? "border-brand bg-[var(--uc-orange)] text-[var(--uc-on-orange)]" : "border-[var(--uc-border)] bg-[var(--uc-surface-2)] text-[var(--uc-text-2)] hover:bg-[var(--uc-surface)]"}`}>

                    {m.name}

                  </button>

                ))}

              </div>

            </div>

          </div>



          {/\* Extra options \*/}

          <div className="uc-card rounded-2xl p-5 space-y-4">

            <h2 className="flex items-center gap-2 text-base font-bold text-[var(--uc-text)]"><span className="uc-step" aria-hidden="true">•</span>?????? ??????</h2>

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm font-semibold text-[var(--uc-text)]">????? ???? ????????</p>

                <p className="text-xs text-[var(--uc-muted)]">{fmt((country?.visa || 0) \* travelers, sym)} ???????</p>

              </div>

              <button type="button" onClick={() => setIncludeVisa(!includeVisa)}

                className={`relative inline-flex h-6 w-11 items-center rounded-full border border-[var(--uc-border)] transition-colors ${includeVisa ? "bg-[var(--uc-orange)]" : "bg-[var(--uc-surface-2)]"}`}>

                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${includeVisa ? "-translate-x-6" : "-translate-x-1"}`} />

              </button>

            </div>

            <div className="space-y-1.5">

              <label className="text-sm font-semibold text-[var(--uc-text)]">?? ??????? ?????? ?????? ({sym})</label>

              <input type="number" min="0" value={extraShopping} onChange={(e) => setExtraShopping(e.target.value)} placeholder="0"

                className="uc-input w-full rounded-xl px-4 py-2.5 text-sm font-semibold" />

            </div>

          </div>

        </div>



        {/\* Results \*/}

        <div className="lg:col-span-2 space-y-4">

          <div className="sticky top-24 space-y-4">

            <div className="uc-result rounded-2xl p-6 space-y-2">

              <p className="text-sm font-medium opacity-80">??????? ????????? ???????</p>

              <p className="text-4xl font-extrabold tracking-tight">{result ? fmt(result.total, sym) : "—"}</p>

              <p className="text-xs opacity-70">?????? ????? ({travelers} ????? · {days} ???)</p>

              {result && (

                <div className="mt-3 rounded-xl bg-[var(--uc-surface)]/15 p-3 backdrop-blur-sm">

                  <p className="text-xs opacity-80">??????? ????? ??????</p>

                  <p className="text-2xl font-bold">{fmt(result.perPerson, sym)}</p>

                </div>

              )}

            </div>



            {result && (

              <div className="uc-card rounded-2xl p-5 space-y-3">

                <h3 className="text-sm font-bold text-[var(--uc-text)]">????? ????????</h3>

                <div className="space-y-2.5">

                  {items.map((item) => {

                    const pct = Math.round((item.value / result.total) \* 100);

                    return (

                      <div key={item.label} className="space-y-1">

                        <div className="flex justify-between text-xs">

                          <span className="font-medium text-[var(--uc-text-2)]">{item.label}</span>

                          <span className="font-bold text-[var(--uc-text)]">{fmt(item.value, sym)}</span>

                        </div>

                        <div className="uc-bar h-1.5 w-full overflow-hidden rounded-full">

                          <div className="uc-bar-fill h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />

                        </div>

                        <p className="text-[10px] text-[var(--uc-muted)]">{pct}% ?? ????????</p>

                      </div>

                    );

                  })}

                </div>

                <div className="uc-warning mt-3 rounded-xl border p-3 text-xs space-y-1 leading-relaxed">

                  <p className="font-bold flex items-center gap-1"><span>??</span> ????? ?????</p>

                  {seasonId === "last_10" && <p>• ????? ??????? ?? ?????? — ????? ?????? ???? ??? ??%</p>}

                  {seasonId === "ramadan" && <p>• ?????: ???? ?????? ??? ? ???? ??? ?????</p>}

                  {hotelId === "5star" && <p>• ????? ? ???? ????? ?? ???? ??% ?? ????? ???????</p>}

                  <p>• ????? ??????? ??? ???????? ????????? ???? ?????</p>

                  <p>• ??????? ?? ??????? ?????? ???? ?????</p>

                </div>

              </div>

            )}



            <div className="uc-card rounded-2xl p-4 text-center space-y-1">

              <p className="text-xs text-[var(--uc-muted)]">?????? ???????</p>

              <p className="text-base font-bold text-[var(--uc-text)]">{season?.name}</p>

              {season?.id !== "regular" && <p className="text-xs text-[var(--uc-orange)]">×{season.hotelMult} ??? ????? ???????</p>}

            </div>

          </div>

        </div>

      </div>

      <p className="mt-8 text-center text-xs text-[var(--uc-muted)]">?? ??? ?????? ??????? ????????? ???. ?????? ??????? ??????? ???? ??????? ???????? ?????? ???????.</p>

    </div>

  );

}
