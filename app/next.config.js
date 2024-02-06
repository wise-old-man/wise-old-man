/** @type {import('next').NextConfig} */

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const withSvgr = require("next-plugin-svgr");

const nextConfig = withBundleAnalyzer(
  withSvgr({
    logging: {
      fetches: {
        fullUrl: true,
      },
    },
    experimental: {
      windowHistorySupport: true,
    },
    images: {
      remotePatterns: [
        {
          protocol: "https",
          hostname: "wiseoldman.ams3.cdn.digitaloceanspaces.com",
        },
      ],
    },
    async redirects() {
      return [
        // Redirects to external websites
        {
          source: "/github",
          destination: "https://github.com/wise-old-man/wise-old-man",
          permanent: true,
        },
        {
          source: "/twitter",
          destination: "https://twitter.com/RubenPsikoi",
          permanent: true,
        },
        {
          source: "/discord",
          destination: "https://discordapp.com/invite/Ky5vNt2",
          permanent: true,
        },
        {
          source: "/patreon",
          destination: "https://patreon.com/wiseoldman",
          permanent: true,
        },
        {
          source: "/flags",
          destination:
            "https://github.com/wise-old-man/wise-old-man/wiki/User-Guide:-How-to-setup-countries-flags",
          permanent: true,
        },
        {
          source: "/docs",
          destination: "https://docs.wiseoldman.net",
          permanent: true,
        },
        // Redirects to page defaults
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
        // RuneLite link redirects (old app's url format -> new app's url format)
        {
          source: "/players/:username/gained/skilling",
          destination: "/players/:username/gained",
          permanent: true,
        },
      ];
    },
  })
);

module.exports = nextConfig;
