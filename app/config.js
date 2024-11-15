const MAINTENANCE_MODE = {
  enabled: true,
  message: `WOM is currently down for planned maintenance - scheduled to end at 23:00 UTC. Plesse check back later or join our Discord for updates.`,
};

const ANNOUNCEMENT_BANNER = {
  enabled: false,
  color: undefined, // "blue" / "yellow" / undefined
  message: undefined,
};

module.exports = {
  MAINTENANCE_MODE,
  ANNOUNCEMENT_BANNER,
};
