export default function BrandValueGrid() {
  const values = [
    {
      title: "مجاني تماماً",
      subtitle: "بلا رسوم أو اشتراك",
      icon: (
        <svg
          className="h-5 w-5 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ),
      iconBg: "bg-[#FF5B04]",
    },
    {
      title: "خصوصية كاملة",
      subtitle: "بياناتك تبقى معك",
      icon: (
        <svg
          className="h-5 w-5 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
      iconBg: "bg-[#1A1A1A]",
    },
    {
      title: "سريع وبسيط",
      subtitle: "نتيجة في ثوانٍ",
      icon: (
        <svg
          className="h-5 w-5 text-white"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      ),
      iconBg: "bg-[#1A1A1A]",
    },
    {
      title: "عربي أولاً",
      subtitle: "مصمم للخليج",
      icon: (
        <svg
          className="h-5 w-5 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
          <path d="M2 12h20" />
        </svg>
      ),
      iconBg: "bg-[#FF5B04]",
    },
  ];

  return (
    <div className="mt-8 sm:mt-12 w-full">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5 lg:gap-4">
        {values.map((v, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: "#FFFFFF",
              color: "#0D0D0D",
            }}
            className="qemlo-white-card flex items-center rounded-[18px] p-3 sm:p-4 lg:p-5 transition-all hover:scale-[1.02]"
          >
            {/* In RTL: First child is on the RIGHT -> The Icon */}
            <div
              className={`flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl ${v.iconBg} shadow-sm me-2.5 sm:me-3.5`}
              aria-hidden="true"
            >
              {v.icon}
            </div>

            {/* Second child is on the LEFT -> The Text */}
            <div className="min-w-0 flex-1 text-start">
              <h3
                style={{ color: "#0D0D0D" }}
                className="qemlo-white-card-title text-xs sm:text-base lg:text-[17px] font-black leading-snug tracking-tight truncate"
              >
                {v.title}
              </h3>
              <p
                style={{ color: "#55554F" }}
                className="qemlo-white-card-desc mt-0.5 text-[10px] sm:text-xs font-semibold truncate"
              >
                {v.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
