// Route tests render in jsdom with a fixed 393 x 852 screen and no notch or home bar, unless a test gives
// the provider initialMetrics (as the real library allows), which the hooks then report.
const React = require('react');
const { View } = require('react-native-web');

const insets = { top: 0, right: 0, bottom: 0, left: 0 };
const frame = { x: 0, y: 0, width: 393, height: 852 };
const InsetsContext = React.createContext(insets);
const FrameContext = React.createContext(frame);

module.exports = {
  __esModule: true,
  SafeAreaProvider: ({ children, initialMetrics }) =>
    React.createElement(
      InsetsContext.Provider,
      { value: initialMetrics ? initialMetrics.insets : insets },
      React.createElement(FrameContext.Provider, { value: initialMetrics ? initialMetrics.frame : frame }, children),
    ),
  SafeAreaView: View,
  SafeAreaInsetsContext: InsetsContext,
  SafeAreaFrameContext: FrameContext,
  useSafeAreaInsets: () => React.useContext(InsetsContext),
  useSafeAreaFrame: () => React.useContext(FrameContext),
  initialWindowMetrics: { insets, frame },
};
