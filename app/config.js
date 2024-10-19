const MAINTENANCE_MODE = {
  enabled: false,
  message: undefined,
};

const ANNOUNCEMENT_BANNER = {
  enabled: true,
  color: "yellow", // "blue" / "yellow" / undefined
  message:
    "We are currently experiencing some unexpected issues with the API. We are aware and will fix ASAP.",
};

module.exports = {
  MAINTENANCE_MODE,
  ANNOUNCEMENT_BANNER,
};
