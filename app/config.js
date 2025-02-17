const MAINTENANCE_MODE = {
  enabled: false,
  message: undefined,
};

const ANNOUNCEMENT_BANNER = {
  enabled: true,
  color: "yellow", // "blue" / "yellow" / undefined
  message: `The OSRS hiscores have been broken for the past few days. Some auto-update group/competition features may not work as expected, we recommend players update themselves individually for now.`,
};

module.exports = {
  MAINTENANCE_MODE,
  ANNOUNCEMENT_BANNER,
};
