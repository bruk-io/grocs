// @react-native-firebase/app's own AppDelegate plugin (modifySwiftAppDelegate) looks for
// `self.moduleName = "..."` or `factory.startReactNative(` as its insertion anchor for
// `FirebaseApp.configure()`. Neither exists in Expo's iOS-27 SceneDelegate-based AppDelegate
// template (React Native startup moved to SceneDelegate), so it silently skips the call and
// logs "Unable to determine correct Firebase insertion point" - `import FirebaseCore` still
// gets added (its import-matcher is more lenient), just never invoked.
//
// Same mechanism as the upstream plugin (withAppDelegate + mergeContents), anchored on this
// template's actual entry point instead.
const { withAppDelegate } = require('@expo/config-plugins');
const { mergeContents } = require('@expo/config-plugins/build/utils/generateCode');

const TAG = 'withFirebaseConfigure';
const ANCHOR = /let delegate = ReactNativeDelegate\(\)/;
const INVOCATION = 'FirebaseApp.configure()';

function withFirebaseConfigure(config) {
  return withAppDelegate(config, (config) => {
    if (config.modResults.language !== 'swift') {
      throw new Error(`withFirebaseConfigure expects a Swift AppDelegate, got "${config.modResults.language}"`);
    }
    if (config.modResults.contents.includes(INVOCATION)) {
      return config;
    }
    config.modResults.contents = mergeContents({
      src: config.modResults.contents,
      newSrc: `    ${INVOCATION}`,
      tag: TAG,
      anchor: ANCHOR,
      offset: 0,
      comment: '//',
    }).contents;
    return config;
  });
}

module.exports = withFirebaseConfigure;
