"use client";
/**
 * Live "how many days until Ramadan" figure. The server renders the same value
 * as of build time (initialDays); this refreshes it in the visitor's browser.
 */
import { useEffect, useState } from "react";
import { daysUntil } from "@/lib/hijriEvents";

export default function RamadanCountdown({ startIso, endIso, initialDays }) {
  const [days, setDays] = useState(initialDays);
  const [inRamadan, setInRamadan] = useState(false);
  useEffect(() => {
    const now = new Date();
    const d = daysUntil(new Date(startIso), now);
    setDays(d);
    setInRamadan(d <= 0 && daysUntil(new Date(endIso), now) > 0);
  }, [startIso, endIso]);

  if (inRamadan) {
    return (
      <p className="rc-big">
        رمضان مبارك — اليوم <strong>{1 - days}</strong> من الشهر
      </p>
    );
  }
  return (
    <p className="rc-big">
      باقي <strong className="rc-num">{Math.max(days, 0)}</strong> يوماً على رمضان
    </p>
  );
}
