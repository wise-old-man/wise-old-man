const MAINTENANCE_MODE = {
  enabled: true,
  message: `WOM is currently down for planned maintenance - scheduled to end at 23:00 UTC. Plesse check back later or join our Discord for updates.`,
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
