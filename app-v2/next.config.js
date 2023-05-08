/** @type {import('next').NextConfig} */

const withSvgr = require("next-plugin-svgr");

const nextConfig = withSvgr({
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
      {
        source: "/ehp",
        destination: "/ehp/main",
        permanent: true,
      },
      {
        source: "/ehb",
        destination: "/ehb/main",
        permanent: true,
      },
    ];
  },
});

module.exports = nextConfig;
