#!/usr/bin/env bash
# Smoke test for the demo APK on a running Android emulator (TASK-10.4). Run by the demo-apk workflow
# inside android-emulator-runner, or by hand against any emulator or device adb can see:
#
#   tools/demo-smoke.sh path/to/grocs-demo.apk [output-dir]
#
# Installs the APK, launches it, waits for the Welcome screen's "Try the demo" button, then fails if
# logcat shows a FATAL EXCEPTION or the app's process is gone. The screenshot, the UI dump and the
# logcat are written to the output directory (default smoke-output) whether it passes or fails, so a
# red run still shows what was on the screen.
set -u

apk="${1:?usage: tools/demo-smoke.sh path/to/grocs-demo.apk [output-dir]}"
out="${2:-smoke-output}"
package="io.bruk.grocs.demo"
wait_seconds=120
mkdir -p "$out"

fail() {
  echo "SMOKE FAIL: $1" >&2
  status=1
}
status=0

adb wait-for-device
adb install -r "$apk" || { echo "SMOKE FAIL: the APK did not install" >&2; exit 1; }
adb logcat -c
adb shell monkey -p "$package" -c android.intent.category.LAUNCHER 1 >/dev/null 2>&1

# Wait for the JavaScript to load and the Welcome screen to draw, or for the app to die first.
shown=0
for ((i = 0; i < wait_seconds; i += 3)); do
  sleep 3
  if adb logcat -d | grep -q "FATAL EXCEPTION"; then break; fi
  if [ -z "$(adb shell pidof "$package" | tr -d '\r')" ]; then break; fi
  adb shell "uiautomator dump --windows /sdcard/ui.xml || uiautomator dump /sdcard/ui.xml" >/dev/null 2>&1
  adb pull /sdcard/ui.xml "$out/ui.xml" >/dev/null 2>&1
  if grep -q "Try the demo" "$out/ui.xml" 2>/dev/null; then
    shown=1
    break
  fi
done
# The app has drawn once; give it a moment more to crash late (a native module failing after first render).
sleep 5

adb shell screencap -p /sdcard/welcome.png
adb pull /sdcard/welcome.png "$out/welcome.png" >/dev/null 2>&1
adb logcat -d > "$out/logcat.txt"

if grep -q "FATAL EXCEPTION" "$out/logcat.txt"; then
  fail "logcat shows a FATAL EXCEPTION:"
  grep -A 12 "FATAL EXCEPTION" "$out/logcat.txt" | head -40 >&2
fi
if [ -z "$(adb shell pidof "$package" | tr -d '\r')" ]; then
  fail "the app's process ($package) is gone"
fi
if [ "$shown" -ne 1 ]; then
  fail "the Welcome screen's \"Try the demo\" did not appear within ${wait_seconds} seconds"
fi

if [ "$status" -eq 0 ]; then echo "smoke ok: $package is running and the Welcome screen shows \"Try the demo\""; fi
exit "$status"
