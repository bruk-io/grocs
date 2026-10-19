// Route tests render in jsdom, where there are no native screens. Each screen is a plain View.
const React = require('react');
const { View } = require('react-native-web');

const passthrough = ({ children }) => React.createElement(React.Fragment, null, children);

module.exports = {
  __esModule: true,
  enableScreens() {},
  enableFreeze() {},
  screensEnabled: () => false,
  Screen: View,
  ScreenContainer: View,
  NativeScreen: View,
  NativeScreenContainer: View,
  ScreenStack: View,
  ScreenStackHeaderConfig: View,
  FullWindowOverlay: View,
  Freeze: passthrough,
  featureFlags: { experiment: {}, stable: {} },
};
