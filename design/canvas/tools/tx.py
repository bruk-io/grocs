"""Token pass for screen files: inline style values -> var(--token), SVG fills -> var(--illo-*).
Usage: python3 tx.py File.dc.html   (rewrites in place; run once on a pristine file)
"""
import re, sys

HEX = {
    "#1F4D33": "var(--color-forest)", "#143522": "var(--color-forest-deep)",
    "#CDEB5B": "var(--color-chartreuse)", "#E2583A": "var(--color-tomato)",
    "#17241B": "var(--color-ink)", "#3D4A41": "var(--color-ink-soft)",
    "#4E5B52": "var(--color-ink-muted)", "#6A766E": "var(--color-ink-hint)",
    "#2F3D33": "var(--color-ink-on-tint)", "#0B120D": "var(--color-ink-deep)",
    "#F1F3EC": "var(--color-surface-canvas)", "#E6EBE2": "var(--color-surface-tint)",
    "#F8F9F5": "var(--color-surface-done)", "#E1E9E4": "var(--color-surface-stage)",
    "#E3EFD9": "var(--color-positive-tint)",
    "#D6DCD1": "var(--color-line)", "#DCE1D8": "var(--color-line-soft)",
    "#9AA59D": "var(--color-line-dashed)", "#CBD3C6": "var(--color-line-done)",
    "#5A665E": "var(--color-done-ink)", "#E3F0B0": "var(--color-focus-ring)",
    "#F6EBD3": "var(--color-meal-amber)", "#5C4513": "var(--color-meal-amber-ink)",
    "#DCE8F0": "var(--color-meal-sky)", "#24455C": "var(--color-meal-sky-ink)",
    "#F8DED6": "var(--color-meal-tomato)", "#8A2F1B": "var(--color-meal-tomato-ink)",
    "#E9ECE6": "var(--color-tag-neutral)", "#9CC3DC": "var(--color-water)",
}
# SVG attribute colours (illustration tokens first)
SVG_HEX = dict(HEX)
SVG_HEX.update({
    "#FF9E9E": "var(--illo-blush)", "#6FA35C": "var(--illo-leaf)",
    "#A9774F": "var(--illo-cremi-cap)", "#C99B73": "var(--illo-cremi-shine)", "#F4E9D8": "var(--illo-cremi-stem)",
    "#6E4A33": "var(--illo-shii-cap)", "#D9C2A3": "var(--illo-shii-spot)", "#EFE3CF": "var(--illo-shii-stem)",
    "#F2B544": "var(--illo-chanty-body)", "#F8D57E": "var(--illo-chanty-shine)", "#D9952A": "var(--illo-chanty-gill)",
    "#CFC8BA": "var(--illo-ollie-cap)", "#E8E2D6": "var(--illo-ollie-rim)", "#B9B1A2": "var(--illo-ollie-line)", "#EEE8DC": "var(--illo-ollie-stem)",
    "#8C6A4A": "var(--illo-morty-cap)", "#5E4430": "var(--illo-morty-pit)", "#F1E6D2": "var(--illo-morty-stem)",
    "#EFE6CF": "var(--illo-enoki-cap)", "#F7F2E6": "var(--illo-enoki-stem)", "#D8CDB4": "var(--illo-enoki-edge)", "#C9B48E": "var(--illo-enoki-base)",
    "#FFFFFF": "var(--color-surface-card)",
})
SPACE = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 40, 56, 64]
SNAP = {1: 2, 3: 4, 5: 6, 7: 8, 9: 10, 11: 12, 13: 14, 15: 16, 17: 18, 19: 20, 21: 20, 22: 24, 23: 24, 26: 24, 30: 32, 36: 40}
TYPE = {9: "micro", 10: "micro", 11: "micro", 12: "caption", 13: "small", 14: "body", 15: "body", 16: "label",
        17: "heading", 18: "heading", 19: "heading", 20: "heading", 22: "heading", 24: "heading", 26: "heading",
        28: "title-m", 30: "title-m", 32: "title-m", 38: "title-l", 60: "display"}
RADIUS = {10: "10", 14: "14", 16: "16", 18: "18", 20: "20", 24: "24", 28: "28", 22: "20", 2: "2", 12: "14", 8: "10"}
WEIGHT = {"600": "var(--weight-medium)", "700": "var(--weight-bold)", "800": "var(--weight-heavy)"}
SIZE = {  # (prop-group, px) -> token
    ("h", 44): "--size-target", ("w", 44): "--size-target",
    ("h", 34): "--size-avatar-l", ("w", 34): "--size-avatar-l",
    ("h", 30): "--size-tile", ("w", 30): "--size-tile",
    ("h", 28): "--size-bullet", ("w", 28): "--size-bullet",
    ("h", 26): "--size-check", ("w", 26): "--size-check",
    ("h", 22): "--size-badge",
    ("h", 56): "--size-control", ("w", 48): "--size-day-tile",
    ("h", 64): "--size-avatar-xl", ("w", 64): "--size-avatar-xl",
    ("minh", 44): "--size-target", ("minh", 60): "--size-row", ("minh", 52): "--size-row-done",
    ("minw", 26): "--size-count", ("minw", 22): "--size-badge",
}


def space(v):
    n = float(v)
    if n == 0:
        return "0"
    ni = int(round(n))
    if ni not in SPACE:
        ni = SNAP.get(ni, ni)
    if ni in SPACE:
        return f"var(--space-{ni})"
    return f"{ni}px"


def conv_value_spaces(val):
    def one(m):
        s = m.group(0)
        neg = s.startswith("-")
        n = s.lstrip("-")[:-2]
        t = space(n)
        if t == "0":
            return "0"
        if neg:
            return f"calc(-1 * {t})" if t.startswith("var(") else s
        return t
    return re.sub(r"-?\d+(?:\.\d+)?px", one, val)


def conv_decl(prop, val, ctx):
    p = prop.strip()
    v = val.strip()
    pl = p.lower()
    # colours
    def hexsub(m):
        h = m.group(0).upper()
        if h == "#FFFFFF":
            return "var(--color-on-brand)" if pl in ("color", "fill", "stroke") else "var(--color-surface-card)"
        if h == "#3D4A41" and ctx.get("neutral_tag"):
            return "var(--color-tag-neutral-ink)"
        if h == "#000000":
            return "var(--color-ink-deep)"
        return HEX.get(h, m.group(0))
    v = re.sub(r"#[0-9A-Fa-f]{6}\b", hexsub, v)
    if pl == "font-family":
        if "Fredoka" in v:
            return p, "var(--font-display)"
        if "Nunito" in v:
            return p, "var(--font-body)"
    if pl == "font-size":
        m = re.fullmatch(r"(\d+)px", v)
        if m and int(m.group(1)) in TYPE:
            return p, f"var(--type-{TYPE[int(m.group(1))]})"
    if pl == "font-weight" and v in WEIGHT:
        return p, WEIGHT[v]
    if pl == "letter-spacing":
        if v in ("0.06em", ".06em"):
            return p, "var(--tracking-caps)"
        if v in ("0.08em", ".08em"):
            return p, "var(--tracking-code)"
    if pl == "border-radius":
        def rr(m):
            n = int(m.group(1))
            if n == 2:
                return "var(--radius-2)"
            if n in RADIUS:
                return f"var(--radius-{RADIUS[n]})"
            return m.group(0)
        v = re.sub(r"(\d+)px", rr, v)
        v = v.replace("999px", "var(--radius-pill)")
        return p, v
    if pl == "border-radius":
        return p, v
    if pl.startswith("padding") or pl.startswith("margin") or pl in ("gap", "row-gap", "column-gap"):
        return p, conv_value_spaces(v)
    if pl in ("height", "width", "min-height", "min-width"):
        m = re.fullmatch(r"(\d+)px", v)
        if m:
            n = int(m.group(1))
            grp = {"height": "h", "width": "w", "min-height": "minh", "min-width": "minw"}[pl]
            tok = SIZE.get((grp, n))
            if tok:
                return p, f"var({tok})"
    if pl.startswith("border") and "radius" not in pl:
        v = re.sub(r"\b2\.5px\b", "var(--line-w-strong)", v)
        v = re.sub(r"\b2px\b", "var(--line-w)", v)
    return p, v


SHADOWS = [
    ("0 6px 0 #143522, 0 14px 24px rgba(23,36,27,0.2)", "var(--shadow-action)"),
    ("0 6px 16px rgba(23,36,27,0.12)", "var(--shadow-float)"),
    ("0 6px 16px rgba(23,36,27,0.14)", "var(--shadow-float)"),
    ("0 10px 24px rgba(23,36,27,0.12)", "var(--shadow-nav)"),
    ("0 -8px 24px rgba(23,36,27,0.12)", "var(--shadow-sheet)"),
    ("0 0 0 4px #E3F0B0", "var(--shadow-focus)"),
    ("0 6px 0 #143522", "var(--shadow-lip)"),
    ("0 4px 0 #D6DCD1", "var(--shadow-lip-soft)"),
    ("0 5px 0 #D6DCD1", "var(--shadow-lip-soft)"),
    ("0 4px 0 #000000", "var(--shadow-lip-ink)"),
    ("0 5px 0 #000000", "var(--shadow-lip-ink)"),
]


def conv_style(style):
    for a, b in SHADOWS:
        style = style.replace(a, b)
    # declarations
    decls = [d for d in re.split(r";(?![^(]*\))", style) if d.strip()]
    ctx = {"neutral_tag": "#E9ECE6" in style}
    out = []
    for d in decls:
        if ":" not in d:
            out.append(d.strip())
            continue
        prop, val = d.split(":", 1)
        p, v = conv_decl(prop, val, ctx)
        out.append(f"{p.strip()}: {v}")
    # hole-only styles like "{{x}}" stay as they were
    return "; ".join(out) + ";"


def convert_markup(seg):
    def st(m):
        raw = m.group(1)
        if "{{" in raw and not re.search(r"[a-z-]+\s*:", raw):
            return m.group(0)
        return 'style="' + conv_style(raw) + '"'
    return re.sub(r'style="([^"]*)"', st, seg)


def convert_svg(seg):
    def at(m):
        attr, h = m.group(1), m.group(2).upper()
        if h in SVG_HEX:
            return f'{attr}="{SVG_HEX[h]}"'
        return m.group(0)
    seg = re.sub(r'\b(fill|stroke)="(#[0-9A-Fa-f]{6})"', at, seg)
    # icon strokes: one 2px stroke
    return seg


def icon_pass(seg):
    # icon svgs (24 grid, stroked, currentColor/var) -> stroke-width 2 + class icon
    def one(m):
        tag = m.group(0)
        if 'viewBox="0 0 24 24"' not in tag or 'stroke=' not in tag:
            return tag
        tag = re.sub(r'stroke-width="[\d.]+"', 'stroke-width="2"', tag)
        if 'class="' in tag:
            tag = tag.replace('class="', 'class="icon ', 1)
        else:
            tag = tag.replace("<svg ", '<svg class="icon" ', 1)
        return tag
    return re.sub(r"<svg\b[^>]*>", one, seg)


def run(path):
    src = open(path).read()
    m = re.search(r"(<x-dc>)(.*?)(</x-dc>)", src, re.S)
    body = m.group(2)
    parts = re.split(r"(<svg\b.*?</svg>)", body, flags=re.S)
    res = []
    for i, part in enumerate(parts):
        if i % 2 == 1:
            part = icon_pass(part)
            part = convert_svg(part)
            # style attrs on svg tag itself are harmless
        else:
            part = convert_markup(part)
        res.append(part)
    body2 = "".join(res)
    # helmet: only body margin + font link
    body2 = re.sub(r"<style>.*?</style>", "<style>body{margin:0}</style>", body2, count=1, flags=re.S)
    src = src[: m.start(2)] + body2 + src[m.end(2):]
    if 'href="grocs.css"' not in src:
        src = src.replace('<script src="./support.js"></script>\n', '<script src="./support.js"></script>\n<link rel="stylesheet" href="grocs.css">\n', 1)
    open(path, "w").write(src)


if __name__ == "__main__":
    for f in sys.argv[1:]:
        run(f)
