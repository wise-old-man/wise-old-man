/** @type {import('next').NextConfig} */

const withSvgr = require("next-plugin-svgr");

const nextConfig = withSvgr({
  experimental: {
    appDir: true,
  },
  images: {
    domains: ["wiseoldman.net"],
  },
  async redirects() {
    return [
      {
        source: "/leaderboards",
        destination: "/leaderboards/top",
        permanent: true,
      },
    ];
  },
});

module.exports = nextConfig;
