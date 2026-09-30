"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginForm() {
  const [pw,  setPw]     = useState("");
  const [err, setErr]    = useState("");
  const [busy, setBusy]  = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!pw || busy) return;
    setBusy(true); setErr("");
    try {
      const res  = await fetch("/api/internal/auth", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ password: pw }),
      });
      if (res.ok) {
        router.push("/internal/pilot-leads");
      } else {
        setErr("كلمة المرور غير صحيحة.");
        setPw("");
      }
    } catch {
      setErr("تعذّر الاتصال — يرجى المحاولة مرة أخرى.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-slate-800 border border-slate-700 p-6 space-y-4">
      <div>
        <label className="block text-slate-400 text-xs font-bold mb-1.5">Admin Password</label>
        <input
          type="password"
          value={pw}
          onChange={e => { setPw(e.target.value); setErr(""); }}
          placeholder="••••••••••••"
          autoFocus
          className="w-full rounded-xl bg-slate-700 border border-slate-600 text-white placeholder-slate-500 px-3.5 py-2.5 text-sm focus:border-amber-400 focus:outline-none"
        />
      </div>
      {err && <p className="text-rose-400 text-xs font-bold">{err}</p>}
      <button type="submit" disabled={busy || !pw}
        className="w-full rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-900 font-black py-2.5 text-sm transition-all">
        {busy ? "جارٍ التحقق..." : "دخول →"}
      </button>
    </form>
  );
}
