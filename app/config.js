const MAINTENANCE_MODE = {
  enabled: false,
  message: undefined,
};

const ANNOUNCEMENT_BANNER = {
  enabled: true,
  color: "yellow", // "blue" / "yellow" / undefined
  message: "Heads up: The site is slow as we roll out server upgrades. Faster performance is on its way.",
};

const LEAGUES = {
  active: false,
  editionName: "Raging Echoes",
};

module.exports = {
  LEAGUES,
  MAINTENANCE_MODE,
  ANNOUNCEMENT_BANNER,
};
