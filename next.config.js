/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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

module.exports = nextConfig;
