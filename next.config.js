/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  async headers() {
    const isPreview = process.env.VERCEL_ENV === "preview";

    const baseHeaders = [
      {
        key: "X-Content-Type-Options",
        value: "nosniff",
      },
      {
        key: "X-Frame-Options",
        value: "SAMEORIGIN",
      },
      {
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin",
      },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=()",
      },
    ];

    if (isPreview) {
      baseHeaders.push({
        key: "X-Robots-Tag",
        value: "noindex, nofollow",
      });
    }

    return [
      {
        // Apply security headers to all routes
        source: "/(.*)",
        headers: baseHeaders,
      },
    ];
  },

  async redirects() {
    return [
      {
        source: "/final-settlement-calculator",
        destination: "/ar/sa/final-settlement-calculator",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
