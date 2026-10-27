import React from "react";

// Simple Footer component for the public Arabic site
// Uses the same CSS token system as Header for consistent styling.
export default function Footer() {
  return (
    <footer className="mt-8 border-t border-[#222222] bg-[#0D0D0D] py-6 text-center text-xs text-[#A3A39E]">
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2">
          {/* Brand logo (same as Header) */}
          <img
            src="/brand/qemlo-mark.svg"
            alt="Qemlo"
            width={24}
            height={24}
            className="h-6 w-6"
          />
          <span className="font-semibold text-[#F5F5F2]">Qemlo</span>
        </div>
        <p className="max-w-xl">
          جميع الأدوات مجانية ومفتوحة المصدر، ولا تتضمن أي إعلانات مزعجة أو تتبع غير مرخص.
        </p>
        <p className="mt-2">
          © {new Date().getFullYear()} Qemlo – جميع الحقوق محفوظة.
        </p>
      </div>
    </footer>
  );
}
