const MAINTENANCE_MODE = {
  enabled: false,
  message: undefined,
};

const ANNOUNCEMENT_BANNER = {
  enabled: true,
  color: "yellow", // "blue" / "yellow" / undefined
  message: `Planned maintenance on November 14th, from 17:00 to 23:00 UTC - The website and API might be unavailable during this time.`,
};

module.exports = {
  MAINTENANCE_MODE,
  ANNOUNCEMENT_BANNER,
};
