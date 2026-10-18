// GENERATED from tokens.json by tools/build-tokens.ts (R59). Do not edit.
// Change tokens.json, then run: pnpm tokens

export const tokens = {
  "color": {
    "surface": "#FFF7EC",
    "surfaceRaised": "#FFFFFF",
    "surfacePressed": "#F3E4CF",
    "text": "#2B2118",
    "textMuted": "#6B5B4D",
    "textOnPrimary": "#FFFFFF",
    "textDisabled": "#8C7F73",
    "primary": "#B5472B",
    "primaryPressed": "#8F361F",
    "border": "#D9C7B0",
    "borderStrong": "#8C7F73",
    "focusRing": "#1F5FBF",
    "danger": "#A32020",
    "badge": "#F2D9A8",
    "textOnBadge": "#4A3512",
    "checkFill": "#2F6B3F",
    "textOnCheckFill": "#FFFFFF"
  },
  "space": {
    "1": 4,
    "2": 8,
    "3": 12,
    "4": 16,
    "5": 24,
    "6": 32
  },
  "radius": {
    "small": 6,
    "medium": 12,
    "large": 20,
    "round": 999
  },
  "size": {
    "touch": 44,
    "icon": 24,
    "check": 28,
    "borderWidth": 1,
    "focusWidth": 3
  },
  "font": {
    "size": {
      "caption": 13,
      "body": 16,
      "title": 22
    },
    "lineHeight": {
      "caption": 18,
      "body": 22,
      "title": 28
    },
    "weight": {
      "regular": "400",
      "bold": "700"
    }
  },
  "opacity": {
    "disabled": 0.5,
    "pressed": 0.85
  },
  "motion": {
    "duration": {
      "fast": 120,
      "base": 200,
      "slow": 320
    }
  },
  "stroke": {
    "icon": 2
  }
} as const;

export type Tokens = typeof tokens;
