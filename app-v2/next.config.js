/** @type {import('next').NextConfig} */

const withSvgr = require("next-plugin-svgr");

const nextConfig = withSvgr({
  experimental: {
    appDir: true,
  },
});

module.exports = nextConfig;
