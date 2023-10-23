/** @type {import('next').NextConfig} */

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const withSvgr = require("next-plugin-svgr");

const nextConfig = withBundleAnalyzer(
  withSvgr({
    images: {
      domains: ["wiseoldman.net"],
    },
    experimental: {
      logging: {
        level: "verbose",
        fullUrl: true,
      },
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
  })
);

module.exports = nextConfig;
