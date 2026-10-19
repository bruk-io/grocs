// iOS 26 glass views do not exist in jsdom. Each one is a plain View, and glass is reported unavailable.
const { View } = require('react-native-web');

module.exports = {
  __esModule: true,
  GlassView: View,
  GlassContainer: View,
  isGlassEffectAPIAvailable: () => false,
  isLiquidGlassAvailable: () => false,
};
