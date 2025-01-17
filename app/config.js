const MAINTENANCE_MODE = {
  enabled: false,
  message: undefined,
};

const ANNOUNCEMENT_BANNER = {
  enabled: false,
  color: "yellow", // "blue" / "yellow" / undefined
  message: "We are aware of the app crashes and we are actively trying to fix them now, thank you for your patience.",
};

module.exports = {
  MAINTENANCE_MODE,
  ANNOUNCEMENT_BANNER,
};
