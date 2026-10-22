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
  # A system "isn't responding" dialog (seen from the launcher, and before that from Play
  # services) can cover the app and leave the dump holding only android/systemui nodes, with
  # no sign of our package - not a sign the app crashed (FATAL EXCEPTION and pidof above already
  # catch that), just something else's dialog in the way. Dismiss it so the next dump can see
  # past it, instead of spending the rest of the budget looking at someone else's dialog.
  if grep -qi "isn.t responding" "$out/ui.xml" 2>/dev/null; then
    adb shell input keyevent KEYCODE_BACK >/dev/null 2>&1
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

# A control fully inside the display's root bounds can still sit under the system navigation
# bar (TASK-36: Welcome's button passed every browser baseline because the browser has no nav
# bar to sit under). The nav bar reserves a rect of the display rather than occupying a node in
# the accessibility tree on every device (gesture navigation has no visible pill there), so the
# authoritative source is the window manager's own inset, not another uiautomator dump.
#
# "Try the demo" names the clickable Button, not the TextView label inside it - checking the
# label's own bounds understates the control's real footprint. The clickable ancestor is found by
# bounds containment (the smallest clickable="true" rect that encloses the label's bounds), since
# uiautomator's dump is one line with no usable line-based nesting to walk.
bounds_containing() {
  # $1: the label's bounds string "[x1,y1][x2,y2]"; reads clickable candidates from stdin.
  local lx1 ly1 lx2 ly2
  IFS=', []' read -r _ lx1 ly1 _ lx2 ly2 _ <<<"$1"
  local best="" best_area=""
  while read -r cand; do
    local cx1 cy1 cx2 cy2
    IFS=', []' read -r _ cx1 cy1 _ cx2 cy2 _ <<<"$cand"
    if [ "$cx1" -le "$lx1" ] && [ "$cy1" -le "$ly1" ] && [ "$cx2" -ge "$lx2" ] && [ "$cy2" -ge "$ly2" ]; then
      local area=$(( (cx2 - cx1) * (cy2 - cy1) ))
      if [ -z "$best_area" ] || [ "$area" -lt "$best_area" ]; then
        best="$cand"
        best_area="$area"
      fi
    fi
  done
  echo "$best"
}

if [ "$shown" -eq 1 ]; then
  label_bounds="$(grep -o 'text="Try the demo"[^>]*bounds="\[[0-9]*,[0-9]*\]\[[0-9]*,[0-9]*\]"' "$out/ui.xml" | grep -o '\[[0-9]*,[0-9]*\]\[[0-9]*,[0-9]*\]' | head -1)"
  button_bounds="$(grep -oE 'clickable="true"[^>]*bounds="\[[0-9]+,[0-9]+\]\[[0-9]+,[0-9]+\]"' "$out/ui.xml" | grep -oE '\[[0-9]+,[0-9]+\]\[[0-9]+,[0-9]+\]' | bounds_containing "$label_bounds")"
  nav_frame="$(adb shell dumpsys window displays | grep -o 'type=navigationBars frame=\[[0-9]*,[0-9]*\]\[[0-9]*,[0-9]*\]' | head -1 | grep -o '\[[0-9]*,[0-9]*\]\[[0-9]*,[0-9]*\]')"
  if [ -z "$label_bounds" ]; then
    fail "could not find \"Try the demo\"'s bounds in the UI dump to check it against the navigation bar"
  elif [ -z "$button_bounds" ]; then
    fail "could not find a clickable ancestor of \"Try the demo\" in the UI dump to check against the navigation bar"
  elif [ -z "$nav_frame" ]; then
    fail "could not find the navigation bar's inset in \"adb shell dumpsys window displays\" to check the button against"
  else
    button_bottom="$(echo "$button_bounds" | sed -E 's/\[[0-9]+,[0-9]+\]\[[0-9]+,([0-9]+)\]/\1/')"
    nav_top="$(echo "$nav_frame" | sed -E 's/\[[0-9]+,([0-9]+)\]\[[0-9]+,[0-9]+\]/\1/')"
    if [ "$button_bottom" -gt "$nav_top" ]; then
      fail "\"Try the demo\" ($button_bounds) overlaps the navigation bar (top $nav_top) - a control a screen names must not sit under system UI"
    fi
  fi
fi

if [ "$status" -eq 0 ]; then echo "smoke ok: $package is running and the Welcome screen shows \"Try the demo\""; fi
exit "$status"
