const MAINTENANCE_MODE = {
  enabled: false,
  message: undefined,
};

const ANNOUNCEMENT_BANNER = {
  enabled: true,
  color: "yellow", // "blue" / "yellow" / undefined
  message: `There was an issue with the hiscores on August 3rd. If your profile is flagged, please log in and out of the game to ensure your hiscores update.`,
};

module.exports = {
  MAINTENANCE_MODE,
  ANNOUNCEMENT_BANNER,
};
