// Route tests render in jsdom with a fixed 393 x 852 screen and no notch or home bar.
const React = require('react');
const { View } = require('react-native-web');

const insets = { top: 0, right: 0, bottom: 0, left: 0 };
const frame = { x: 0, y: 0, width: 393, height: 852 };
const InsetsContext = React.createContext(insets);
const FrameContext = React.createContext(frame);

module.exports = {
  __esModule: true,
  SafeAreaProvider: ({ children }) => children,
  SafeAreaView: View,
  SafeAreaInsetsContext: InsetsContext,
  SafeAreaFrameContext: FrameContext,
  useSafeAreaInsets: () => insets,
  useSafeAreaFrame: () => frame,
  initialWindowMetrics: { insets, frame },
};
