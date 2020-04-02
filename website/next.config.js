const withSass = require('@zeit/next-sass');
const withFonts = require('next-fonts');

module.exports = withSass(withFonts({}));
