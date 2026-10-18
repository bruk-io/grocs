import json, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from ds_lib import *

HFILE = os.path.join(os.path.dirname(__file__), "ds_heights.json")
HEIGHTS = json.load(open(HFILE)) if os.path.exists(HFILE) else {}

HEAD = '''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>{title}</title>
<script src="./support.js"></script>
<link rel="stylesheet" href="grocs.css">
</head>
<body>
<x-dc>
<helmet>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&amp;family=Nunito:wght@500;600;700;800&amp;display=swap">
<style>body{{margin:0}}</style>
</helmet>
'''
TAIL = '''</x-dc>
<script type="text/x-dc" data-dc-script data-props='{{"$preview":{{"width":1200,"height":{h}}}}}'>
class Component extends DCLogic {{
  renderVals() {{ return {{}}; }}
}}
</script>
</body>
</html>
'''


def write(fname, num, title, doc_title, lead, body):
    h = HEIGHTS.get(fname, 2000)
    style = f"width: 1200px; height: {h}px;" if fname in HEIGHTS else "width: 1200px;"
    out = HEAD.format(title=doc_title)
    out += f'<div class="ds-board" style="{style}">\n  <div class="ds-head">\n    <span class="ds-label">Grocs design system · {num} of 5</span>\n    <h1 class="ds-title">{title}</h1>\n    <p class="ds-lead">{lead}</p>\n  </div>\n\n{body}</div>\n'
    out += TAIL.format(h=h)
    open(P + fname, "w").write(out)


def card(label, inner, cls="ds-card", style=""):
    lab = f'<span class="ds-label">{label}</span>\n' if label else ""
    return f'  <section class="{cls}"{f" style=\"{style}\"" if style else ""}>\n    {lab}{inner}\n  </section>\n'


def grid(cols, items, gap="var(--space-24)", align="start", style=""):
    return f'  <div style="display: grid; grid-template-columns: repeat({cols}, minmax(0, 1fr)); gap: {gap}; align-items: {align};{style}">\n{items}  </div>\n'


def nm(t):
    return f'<span class="ds-name">{t}</span>'


def cap(t):
    return f'<span class="ds-cap">{t}</span>'


def mono(t):
    return f'<span class="ds-mono">{t}</span>'


def stack(*parts, gap="var(--space-8)", style=""):
    return f'<div style="display: flex; flex-direction: column; gap: {gap};{style}">' + "".join(parts) + "</div>"


def rowflex(*parts, gap="var(--space-12)", style=""):
    return f'<div style="display: flex; flex-wrap: wrap; align-items: center; gap: {gap};{style}">' + "".join(parts) + "</div>"


# =============================================================== 1 TOKENS
def tokens():
    def sw(name, var, hexv, note="", border=False, text=None):
        bd = " border: var(--line-w) solid var(--color-line-soft);" if border else ""
        inner = f'<span style="color: var(--color-{text});">Aa</span>' if text else ""
        return f'<div class="ds-sw"><div class="ds-swatch" style="background: var(--{var});{bd}">{inner}</div>{nm(name)}{mono(hexv + (" · " + note if note else ""))}</div>'
    def pair(name, k, hx1, hx2):
        return f'<div class="ds-sw"><div class="ds-swatch" style="background: var(--color-{k}); color: var(--color-{k}-ink);">Aa</div>{nm(name)}{mono(hx1 + " / " + hx2)}</div>'
    brand = '<div style="display: flex; flex-wrap: wrap; gap: var(--space-14);">' + "".join([
        sw("color.forest", "color-forest", "#1F4D33", "primary"),
        sw("color.forest-deep", "color-forest-deep", "#143522", "pressed, lip"),
        sw("color.chartreuse", "color-chartreuse", "#CDEB5B", "highlight"),
        sw("color.tomato", "color-tomato", "#E2583A", "live, presence"),
        sw("color.on-brand", "color-on-brand", "#FFFFFF", "on forest, ink", border=True),
    ]) + '</div>' + '<span class="ds-label" style="margin-top: var(--space-6);">Colour · feedback</span>' + '<div style="display: flex; flex-wrap: wrap; gap: var(--space-14);">' + "".join([
        sw("color.error", "color-error", "#B42318", "6.6:1 on card"),
        sw("color.error-tint", "color-error-tint", "#FDE8E5", "error fill"),
        sw("color.disabled", "color-disabled", "#E3E7DF", "fill"),
        sw("color.disabled-ink", "color-disabled-ink", "#7D877F", "text, exempt"),
    ]) + '</div>'
    meal = '<div style="display: flex; flex-wrap: wrap; gap: var(--space-14);">' + "".join([
        pair("color.meal-amber", "meal-amber", "#F6EBD3", "#5C4513"),
        pair("color.meal-sky", "meal-sky", "#DCE8F0", "#24455C"),
        pair("color.meal-tomato", "meal-tomato", "#F8DED6", "#8A2F1B"),
        pair("color.meal-leaf", "meal-leaf", "#E3EFD9", "#1F4D33"),
        pair("color.tag-neutral", "tag-neutral", "#E9ECE6", "#3D4A41"),
    ]) + '</div>' + cap("Fill and ink pairs, each 4.5:1 or better. A meal keeps its colour on the plan, in the list tags and in chips. Status never borrows them. The neutral pair covers an unknown meal, Eating out and Pantry staple.")
    ink = [("color.ink", "color-ink", "#17241B"), ("color.ink-soft", "color-ink-soft", "#3D4A41"), ("color.ink-muted", "color-ink-muted", "#4E5B52"),
           ("color.ink-hint", "color-ink-hint", "#6A766E"), ("color.ink-on-tint", "color-ink-on-tint", "#2F3D33"), ("color.ink-deep", "color-ink-deep", "#0B120D")]
    surf = [("color.surface-canvas", "color-surface-canvas", "#F1F3EC"), ("color.surface-card", "color-surface-card", "#FFFFFF"), ("color.surface-tint", "color-surface-tint", "#E6EBE2"),
            ("color.surface-done", "color-surface-done", "#F8F9F5"), ("color.surface-stage", "color-surface-stage", "#E1E9E4"), ("color.positive-tint", "color-positive-tint", "#E3EFD9")]
    line = [("color.line", "color-line", "#D6DCD1"), ("color.line-soft", "color-line-soft", "#DCE1D8"), ("color.line-dashed", "color-line-dashed", "#9AA59D"),
            ("color.line-done", "color-line-done", "#CBD3C6"), ("color.done-ink", "color-done-ink", "#5A665E"), ("color.focus-ring", "color-focus-ring", "#E3F0B0")]
    def swrow(items):
        return '<div style="display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: var(--space-14);">' + "".join(
            f'<div style="display: flex; flex-direction: column; gap: var(--space-6);"><div class="ds-swatch" style="background: var(--{v}); border: var(--line-w) solid var(--color-line-soft); height: 48px;"></div>{nm(n)}{mono(h)}</div>' for n, v, h in items) + '</div>'
    neutrals = swrow(ink) + swrow(surf) + swrow(line)
    illo = [("Cremi", ["illo-cremi-cap", "illo-cremi-shine", "illo-cremi-stem"]), ("Shii", ["illo-shii-cap", "illo-shii-spot", "illo-shii-stem"]),
            ("Chanty", ["illo-chanty-body", "illo-chanty-shine", "illo-chanty-gill"]), ("Ollie", ["illo-ollie-cap", "illo-ollie-rim", "illo-ollie-line", "illo-ollie-stem"]),
            ("Morty", ["illo-morty-cap", "illo-morty-pit", "illo-morty-stem"]), ("Enoki", ["illo-enoki-cap", "illo-enoki-stem", "illo-enoki-edge", "illo-enoki-base"]),
            ("Shared", ["illo-blush", "illo-leaf", "color-water", "color-ink"])]
    groups = "".join(f'<div style="display: flex; flex-direction: column; gap: var(--space-6);">{nm("illo." + n.lower())}<div style="display: flex; gap: var(--space-6);">' + "".join(f'<span title="{v}" style="width: 28px; height: 28px; border-radius: 50%; border: var(--line-w) solid var(--color-line-soft); background: var(--{v});"></span>' for v in vs) + '</div></div>' for n, vs in illo)
    illo_html = f'<div style="display: flex; flex-wrap: wrap; gap: var(--space-24);">{groups}</div>' + cap("Mascots paint only with these. Kitchen scene one-offs stay inside the scene illustration.")

    types = [("display", "Fredoka 700", "60 / 60", "Grocs", "t-display"), ("title-l", "Fredoka 700", "38 / 38", "Groceries", "t-title-l"), ("title-m", "Fredoka 700", "32 / 34", "Add a meal", "t-title-m"),
             ("heading", "Fredoka 600", "18 / 24", "Invite your partner", "t-heading"), ("label", "Nunito 800", "16 / 20", "Yellow onions", "t-label"), ("body", "Nunito 600", "15 / 22", "Paste a few items at once", "t-body"),
             ("small", "Nunito 600", "13 / 18", "Dairy &amp; eggs · usually 1 dozen", "t-small"), ("caption", "Nunito 800", "12 / 16", "INVITE CODE", "t-caption"), ("micro", "Nunito 800", "11 / 14", "CHANA MASALA", "t-micro")]
    typ = "".join(f'<div style="display: flex; align-items: baseline; justify-content: space-between; gap: var(--space-16);"><span class="{c}">{s}</span><span style="text-align: right;">{nm("type." + n)}<br>{mono(f"{f} · {sz} · --type-{n}")}</span></div>' for n, f, sz, s, c in types)

    space = "".join(f'<div style="display: flex; align-items: center; gap: var(--space-12);"><span style="width: {n}px; height: 16px; background: var(--color-forest); border-radius: var(--radius-2); flex: none;"></span>{cap(f"space.{n} · {n}" + note)}</div>' for n, note in [
        (2, ""), (4, ""), (6, " · tag gaps"), (8, ""), (10, " · header rows"), (12, ""), (14, " · row padding"), (16, " · screen gutter"), (18, " · card padding"), (20, " · header inset"), (24, " · card, action bar"), (28, ""), (32, ""), (40, ""), (56, " · board top"), (64, " · board side")])
    radii = "".join(f'<div style="display: flex; flex-direction: column; gap: var(--space-4); align-items: center;"><span style="width: 52px; height: 52px; border-radius: var(--radius-{r}); background: var(--color-surface-tint); border: var(--line-w) solid var(--color-line);"></span>{cap(r if r != "pill" else "pill")}</div>' for r in ["10", "14", "16", "18", "20", "24", "28", "pill"])
    radius_html = f'<div style="display: flex; flex-wrap: wrap; gap: var(--space-12);">{radii}</div>' + cap("10 icon tile · 14 ghost buttons · 16 size-s buttons, bubble, status row · 18 tabs, invite code, stepper · 20 rows, fields, size-m buttons, meal cards · 24 cards, nav bar · 28 sheets · pill tags, chips. 2 is for thin bars only.")
    sizes = [("size.target", "44", "touch minimum, size-s button"), ("size.control", "56", "size-m button, field"), ("size.row", "60", "item row, meal card"), ("size.row-done", "52", "ticked row"), ("size.tab", "52", "tab item"),
             ("size.day-tile", "48", "weekday tile width"), ("size.tile", "30", "icon tile"), ("size.avatar-l", "34", "avatar.l"), ("size.avatar-s", "26", "avatar.s, check, count"), ("size.badge", "22", "tab badge"),
             ("size.mascot-header", "68", "header host"), ("line.w", "2", "every border"), ("line.w-strong", "2.5", "ring, strike")]
    sizes_html = '<table class="ds-table">' + "".join(f'<tr><td class="ds-name" style="padding: var(--space-4) 0;">{n}</td><td style="padding: var(--space-4) 0;" class="ds-mono">{v}</td><td class="ds-cap" style="padding: var(--space-4) 0;">{d}</td></tr>' for n, v, d in sizes) + '</table>'

    def shadow_demo(name, var, desc, extra=""):
        return f'<div style="display: flex; flex-direction: column; gap: var(--space-8);"><span style="height: 44px; border-radius: var(--radius-16); background: var(--color-surface-card); border: var(--line-w) solid var(--color-line); box-shadow: var(--{var}); {extra}"></span>{nm(name)}{cap(desc)}</div>'
    shadows = '<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--space-24) var(--space-32);">' + "".join([
        shadow_demo("shadow.lip", "shadow-lip", "0 6 0 forest-deep · size-m primary", "background: var(--color-forest); border-color: var(--color-forest);"),
        shadow_demo("shadow.lip-soft", "shadow-lip-soft", "0 4 0 line · size-m secondary"),
        shadow_demo("shadow.lip-ink", "shadow-lip-ink", "0 4 0 ink-deep · ink button", "background: var(--color-ink); border-color: var(--color-ink);"),
        shadow_demo("shadow.float", "shadow-float", "0 6 16 ink 12% · bubble, raised card"),
        shadow_demo("shadow.nav", "shadow-nav", "0 10 24 ink 12% · floating tab bar"),
        shadow_demo("shadow.action", "shadow-action", "lip plus 0 14 24 ink 20% · action bar", "background: var(--color-forest); border-color: var(--color-forest);"),
        shadow_demo("shadow.sheet", "shadow-sheet", "0 -8 24 ink 12% · bottom sheet"),
        shadow_demo("shadow.focus", "shadow-focus", "4 focus-ring halo · focused field"),
        shadow_demo("shadow.focus-error", "shadow-focus-error", "4 error-tint halo · field in error", "border-color: var(--color-error);"),
    ]) + '</div>'

    def motion(cls, name, spec, desc, shape="50%"):
        return f'<div style="display: flex; gap: var(--space-14); align-items: center;"><span class="{cls}" style="width: 36px; height: 36px; border-radius: {shape}; background: var(--color-forest); flex: none;"></span><span style="display: flex; flex-direction: column; gap: var(--space-2);">{nm(name)}{mono(spec)}{cap(desc)}</span></div>'
    motions = '<div style="display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: var(--space-24);">' + "".join([
        motion("ds-demo-pulse", "motion.pop", ".4s · ease-pop", "ticks, chips appearing"),
        motion("ds-demo-rise", "motion.rise", ".5s · ease-rise", "rows entering, 40ms stagger", "var(--radius-14)"),
        motion("ds-demo-land", "motion.land", ".6s · ease-land", "cart arrivals, toast, banners", "var(--radius-14)"),
        motion("breathe", "motion.idle", "1.6 to 5s · ease-in-out", "mascot loops, add bullet"),
    ]) + '</div>' + cap("Tap reaction 1.3s, speech bubble 2.8s, tick 520ms. Every loop stops under reduce-motion and under the .calm switch.")

    body = grid(2, card("Colour · brand", brand) + card("Colour · meal tags", meal))
    body += card("Colour · ink, surface and line", neutrals)
    body += card("Colour · illustration palette", illo_html)
    body += grid(2, card("Type · one value per token", f'<div style="display: flex; flex-direction: column; gap: var(--space-14);">{typ}</div>') +
                 f'<div style="display: flex; flex-direction: column; gap: var(--space-24);">' + card("Radius", radius_html).replace("  <section", "<section", 1) + card("Size and line", sizes_html).replace("  <section", "<section", 1) + '</div>\n')
    body += grid(2, card("Space", f'<div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-10) var(--space-24);">{space}</div>') + card("Shadow", shadows))
    body += card("Motion", motions)
    write("DS-Tokens.dc.html", 1, "Tokens", "Design system: tokens", "The named decisions every atom is made from. One value per token; nothing below this level.", body)


# =============================================================== 2 ATOMS
def atoms():
    # text atoms
    t = [("text.display", "t-display", "Grocs", "Fredoka 700 · 60"), ("text.title-l", "t-title-l", "Groceries", "Fredoka 700 · 38"), ("text.title-m", "t-title-m", "Add a meal", "Fredoka 700 · 32"),
         ("text.heading", "t-heading", "Invite your partner", "Fredoka 600 · 18"), ("text.label", "t-label", "Yellow onions", "Nunito 800 · 16"), ("text.body", "t-body", "Paste a few items at once", "Nunito 600 · 15"),
         ("text.small", "t-small", "Dairy &amp; eggs · usually 1 dozen", "Nunito 600 · 13"), ("text.caption", "t-caption", "INVITE CODE", "Nunito 800 · 12"), ("text.micro", "t-micro", "CHANA MASALA", "Nunito 800 · 11")]
    ta = "".join(f'<div style="display: flex; flex-direction: column; gap: var(--space-4); min-width: 0;"><span class="{c}" style="color: var(--color-ink);">{s}</span>{nm(n)}{cap(d)}</div>' for n, c, s, d in t)
    text_card = card("Text · one atom per type token", f'<div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--space-20) var(--space-24);">{ta}</div>')

    # button matrix
    def btn(variant, state, label=None):
        base = {
            "primary": ("btn btn-m btn-primary", "Add to list", None),
            "primary--s": ("btn btn-s btn-primary", "Add", None),
            "secondary": ("btn btn-m btn-secondary", "Continue with Google", None),
            "secondary--s": ("btn btn-s btn-secondary", "Copy code", None),
            "soft": ("btn btn-s btn-soft", "Paste", None),
            "text": ("btn btn-s btn-text", "Try again", None),
            "back": ("btn btn-s btn-text", "Meal plan", "back"),
            "icon": ("btn btn-s btn-icon btn-primary", "", "add"),
            "icon--soft": ("btn btn-s btn-icon btn-soft", "", "add"),
            "icon--ghost": ("btn btn-s btn-icon btn-text", "", "add"),
        }[variant]
        cls, text, ic = base
        if state == "pressed": cls += " is-pressed"
        if state == "focus": cls += " is-focus"
        if state == "disabled": cls += " is-disabled"
        if state == "loading": cls += " is-loading"
        dis = " disabled" if state == "disabled" else ""
        busy = ' aria-busy="true"' if state == "loading" else ""
        lab = ' aria-label="Add item"' if variant.startswith("icon") else ""
        inner = ""
        if state == "loading":
            inner = spinner("on-brand" if variant.startswith("primary") or variant == "icon" else "forest")
            if text and not variant.startswith("icon"): inner += {"primary": "Adding", "primary--s": "Adding", "secondary": "Signing in", "secondary--s": "Copying", "soft": "Pasting", "text": "Trying", "back": "Going"}.get(variant, text)
        else:
            if ic == "back": inner = icon("back", 22) + text
            elif ic == "add": inner = icon("add", 20)
            else: inner = text
        w = ' style="width: 100%;"' if variant in ("primary", "secondary") else ""
        if variant in ("secondary",) and state != "loading": pass
        return f'<button type="button" class="{cls}"{dis}{busy}{lab}{w}>{inner}</button>'
    states = ["rest", "pressed", "focus", "disabled", "loading"]
    rows = ""
    for v, desc in [("primary", "One per screen. Pinned action bar. 56 tall, radius 20, lip."), ("primary--s", "Inside a card or field. 44 tall, radius 16, no lip."),
                    ("secondary", "Alternative next to a primary. Google sign-in."), ("secondary--s", "Inside a card, beside a primary."),
                    ("soft", "Inside fields and cards."), ("text", "Low-emphasis choice."), ("back", "Always names the parent screen."),
                    ("icon", "44 × 44, always carries an aria-label."), ("icon--soft", "Suggestion row add."), ("icon--ghost", "Stepper, week arrows.")]:
        rows += f'<div style="min-width: 0;">{nm("button." + v)}<br>{cap(desc)}</div>' + "".join(f'<div style="min-width: 0;">{btn(v, s)}</div>' for s in states)
    head = '<span></span>' + "".join(f'<span class="ds-label">{s}</span>' for s in states)
    button_card = card("Button · rest, pressed, focus, disabled, loading", f'<div style="display: grid; grid-template-columns: 200px repeat(5, minmax(0, 1fr)); gap: var(--space-14) var(--space-16); align-items: center;">{head}{rows}</div>', style="")

    # inputs
    ins = ""
    for i, (s, lab) in enumerate([("rest", "rest"), ("focus", "focus"), ("filled", "filled"), ("error", "error"), ("disabled", "disabled")]):
        extra = f'<span class="t-small" style="color: var(--color-error); display: flex; gap: var(--space-4); align-items: center;">{icon("alert", 14)}Enter a name</span>' if s == "error" else ""
        ins += f'<div style="display: flex; flex-direction: column; gap: var(--space-6); min-width: 0;"><label for="a-in{i}" class="ds-name">input.text--{lab}</label>{input_text(s, id_="a-in" + str(i), value=("" if s in ("rest", "disabled") else None), placeholder=("Paste a link" if s != "disabled" else "Can not edit"))}{extra}</div>'
    inline = f'<div style="display: flex; flex-direction: column; gap: var(--space-6); min-width: 0;"><span class="ds-name">input.text--inline · rest, focus</span>{add_bar("rest")}{add_bar("focus", "egg")}</div>'
    input_card = card("Input · text field states", f'<div style="display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: var(--space-16);">{ins}</div>' + inline.replace('min-width: 0;"><span class="ds-name">input.text--inline · rest, focus</span>', 'min-width: 0; max-width: 520px;"><span class="ds-name">input.text--inline · rest, focus</span>', 1))

    # selection: check, switch, meter, chip
    def lab(x, n): return f'<div style="display: flex; flex-direction: column; gap: var(--space-6); align-items: center;">{x}{cap(n)}</div>'
    checks = rowflex(lab(check("off"), "check--off"), lab('<span class="press is-pressed" style="display: flex;">' + check("off") + '</span>', "check--pressed"), lab(check("on"), "check--on"), lab(check("ticking"), "check--ticking"),
                     lab('<span style="outline: 3px solid var(--color-forest); outline-offset: 2px; border-radius: 50%; display: flex;">' + check("off") + '</span>', "check--focus"), lab(check("disabled"), "check--disabled"), gap="var(--space-24)")
    sws = rowflex(lab(switch("off"), "switch--off"), lab(switch("on"), "switch--on"), lab(switch("focus"), "switch--focus"), lab(switch("disabled"), "switch--disabled"), lab(switch("disabled-on"), "switch--disabled-on"), gap="var(--space-24)")
    meter = lambda w: f'<span style="height: var(--size-meter); width: 120px; border-radius: var(--radius-pill); background: var(--color-line-soft); overflow: hidden; display: flex;"><span style="width: {w}%; background: var(--color-forest); border-radius: var(--radius-pill);"></span></span>'
    meters = rowflex(lab(meter(0), "meter--empty"), lab(meter(40), "meter--part"), lab(meter(100), "meter--full"), gap="var(--space-24)")
    def chip(kind, state):
        if kind == "meal":
            bg, fg = "var(--color-meal-amber)", "var(--color-meal-amber-ink)"
            base = f"min-height: var(--size-target); padding: 0 var(--space-16); border: var(--line-w) solid transparent; border-radius: var(--radius-pill); background: {bg}; color: {fg}; font-size: var(--type-body); font-weight: var(--weight-heavy); display: flex; align-items: center; gap: var(--space-6);"
            txt = "Chana masala"; lead = ""
            if state == "selected": base = base.replace("transparent", "var(--color-meal-amber-ink)"); lead = icon("check", 16)
        else:
            base = f"min-height: var(--size-target); padding: 0 var(--space-14); border: var(--line-w) solid var(--color-line); border-radius: var(--radius-pill); background: var(--color-surface-card); color: var(--color-ink); font-size: var(--type-body); font-weight: var(--weight-bold); display: flex; align-items: center; gap: var(--space-6);"
            txt = "Bananas"; lead = f'<span style="color: var(--color-forest); display: flex;">{icon("add", 14)}</span>'
            if state == "selected": base = base.replace("var(--color-line);", "var(--color-forest);");
        cls = "chip"
        extra = ""
        if state == "pressed": extra = " transform: scale(.92);"
        if state == "focus": extra = " outline: 3px solid var(--color-forest); outline-offset: 2px;"
        if state == "disabled":
            base = f"min-height: var(--size-target); padding: 0 var(--space-16); border: var(--line-w) solid var(--color-line-soft); border-radius: var(--radius-pill); background: var(--color-disabled); color: var(--color-disabled-ink); font-size: var(--type-body); font-weight: var(--weight-heavy); display: flex; align-items: center; gap: var(--space-6);"
        dis = " disabled" if state == "disabled" else ""
        pressed = ' aria-pressed="true"' if state == "selected" else ' aria-pressed="false"'
        return f'<button type="button" class="{cls}"{dis}{pressed} style="{base}{extra}">{lead}{txt}</button>'
    chips = ""
    for k in ("meal", "quick"):
        chips += f'<div style="display: flex; flex-direction: column; gap: var(--space-8);">{nm("chip." + ("meal" if k == "meal" else "quick-add"))}' + rowflex(*[f'<span style="display: flex; flex-direction: column; gap: var(--space-4); align-items: flex-start;">{chip(k, s)}{cap("--" + s)}</span>' for s in ["rest", "pressed", "selected", "focus", "disabled"]], gap="var(--space-16)") + '</div>'
    sel_card = card("Selection · check, switch, meter", stack(checks, sws, meters, gap="var(--space-20)"))
    chip_card = card("Chip · rest, pressed, selected, focus, disabled", stack(chips, gap="var(--space-20)"))

    # tags
    tags = stack(
        rowflex(badge_meal("Chana masala", "amber"), badge_meal("Sheet-pan chicken", "sky"), badge_meal("Pizza night", "tomato"), badge_meal("Green salad", "leaf"), tag_neutral("Eating out")),
        cap("badge.meal--amber, --sky, --tomato, --leaf, --neutral · the colour comes from the meal, never from status"),
        rowflex(tag_status("On your list"), tag_neutral("Pantry staple"), tag_new(), tag_sync(), tag_date("Thursday, Oct 22")),
        cap("tag.status · tag.neutral · tag.new · tag.sync · tag.date"),
        rowflex(count_neutral(5), count_accent(14)),
        cap("count.neutral · count.accent"), gap="var(--space-10)")
    pe = rowflex(avatar_l("B", "B", ring="card"), avatar_l("S", "S", ring="card", online=True), avatar_s("S"), tile_day("THU", "22"), gap="var(--space-24)")
    people = stack(pe, cap("avatar.l · avatar.l--online (tomato ring) · avatar.s · tile.day"), gap="var(--space-10)")
    badge_card = card("Badge, tag, count, avatar, tile", stack(tags, people, gap="var(--space-16)"))

    # icons
    names = ["produce", "meat", "dairy", "bakery", "pantry", "cart", "calendar", "link", "share", "back", "forward", "add", "remove", "check", "settings", "clock", "cloud-off", "alert", "copy"]
    icons = "".join(f'<div style="display: flex; flex-direction: column; align-items: center; gap: var(--space-6); color: var(--color-forest);">{icon(n, 24)}{cap("icon." + n)}</div>' for n in names)
    tile = f'<div style="display: flex; align-items: center; gap: var(--space-12);"><span aria-hidden="true" style="width: var(--size-tile); height: var(--size-tile); border-radius: var(--radius-10); background: var(--color-surface-tint); color: var(--color-forest); display: flex; align-items: center; justify-content: center;">{icon("produce", 18)}</span>{cap("icon.tile · 30 square, radius 10, tint, holds one 18 icon")}</div>'
    icon_card = card("Icon · 24 grid, one 2px round stroke at every size", f'<div style="display: grid; grid-template-columns: repeat(10, minmax(0, 1fr)); gap: var(--space-16) var(--space-8);">{icons}</div>{tile}')

    # speech bubble, invite code, spinner, skeleton
    misc = stack(speech_bubble("Mm? I'm resting my eyes."), cap("speech.bubble · small text, float shadow, pairs with a mascot and is announced to screen readers"), gap="var(--space-10)")
    misc2 = stack(invite_code(), cap("invite.code · caption label, title-m code, dashed line"), gap="var(--space-10)")
    misc3 = stack(rowflex(spinner(), '<span class="shimmer" style="width: 120px; height: var(--space-12); border-radius: var(--radius-pill); background: var(--color-line-soft);"></span>', gap="var(--space-16)"), cap("spinner · skeleton.line (shimmer)"), gap="var(--space-10)")
    misc_card = card("Bubble, code, loading", grid(3, f'<div>{misc}</div><div>{misc2}</div><div>{misc3}</div>', gap="var(--space-24)").replace("  <div", "<div", 1))

    # mascots
    ms = [("cremi", "Groceries · eager"), ("shii", "Meal plan · sleepy"), ("chanty", "Add a meal, invite · dramatic"), ("ollie", "Add an item, offline · shy"), ("morty", "Settings, recipe import · nerdy"), ("enoki", "Your kitchen, all done · giggly")]
    mhtml = "".join(f'<div style="display: flex; flex-direction: column; align-items: center; gap: var(--space-6); text-align: center;">{mascot(w, 72)}{nm("mascot." + w)}{cap(c)}</div>' for w, c in ms)
    mascot_card = card("Mascot · one host per screen, always tappable, always labelled", f'<div style="display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: var(--space-16);">{mhtml}</div>' + cap("Shared: 64 grid, ink eyes that blink, blush, no outlines, 68 px in a header. The idle loop is personal; the tap reaction plus a speech bubble is shared."))

    body = text_card + button_card + input_card + grid(2, sel_card + chip_card) + badge_card + icon_card + misc_card + mascot_card
    write("DS-Atoms.dc.html", 2, "Atoms", "Design system: atoms", "The smallest working parts. Each uses tokens only and does one job. Interactive atoms show every state.", body)


# =============================================================== 3 MOLECULES
def molecules():
    def mol(name, parts, note):
        return card(None, nm(name) + stack(*parts, gap="var(--space-10)") + cap(note), cls="ds-card ds-card-s")
    def sub(label, x): return f'<div style="display: flex; flex-direction: column; gap: var(--space-4);">{x}{cap(label)}</div>'
    def labelled(state):
        lab = '<span class="t-body" style="margin: 0 var(--space-6); font-weight: var(--weight-heavy);">Recipe link <span style="font-weight: var(--weight-medium); color: var(--color-ink-muted);">(optional)</span></span>'
        f = f'<div class="field-box{" is-error" if state == "error" else ""}" style="display: flex; gap: var(--space-8); align-items: center; border-radius: var(--radius-20); padding: var(--space-4) var(--space-4) var(--space-4) var(--space-18);"><span style="flex: 1; min-width: 0; color: var(--color-ink-hint); font-size: var(--type-label); font-weight: var(--weight-medium);">Paste a link</span><span class="btn btn-s btn-soft">Paste</span></div>'
        hint = '<span class="t-small" style="margin: 0 var(--space-6); color: var(--color-ink-muted);">Saved with the meal, so the recipe is easy to find again.</span>' if state == "rest" else f'<span class="t-small" style="margin: 0 var(--space-6); color: var(--color-error); display: flex; gap: var(--space-4); align-items: center;">{icon("alert", 14)}That link does not look right.</span>'
        return f'<div style="display: flex; flex-direction: column; gap: var(--space-6);">{lab}{f}{hint}</div>'
    cards = [
        mol("item.row", [sub("item.row--rest", item_row()), sub("item.row--pressed", item_row("Garlic", "4 cloves", [badge_meal("Chana masala", "amber")], True, "pressed")), sub("item.row--done", item_row_done()), sub("item.row--swiped", item_row_swiped()), sub("item.row--loading", item_row_loading())], "check · text.label · text.small · badge.meal × n · avatar.s. Pressed scales to 97%. Swipe reveals Remove. Loading is the import skeleton."),
        mol("add.bar", [sub("add.bar--rest", add_bar("rest")), sub("add.bar--focus", add_bar("focus", "egg"))], "input.text--inline · button.icon. Same 56 box as every field."),
        mol("field.labelled", [sub("field.labelled--rest", labelled("rest")), sub("field.labelled--error", labelled("error"))], "text.body label · input.text · button.soft · text.small hint. The field box is 56 tall."),
        mol("section.header", [section_header("Produce", "produce", 6), section_header("Dairy &amp; eggs", "dairy", 2)], "icon.tile · text.heading · count.neutral"),
        mol("progress.bar", [progress_bar(18, 14, 3), progress_bar(100, 0, 17)], "text.small × 2 · meter. The counts come from the list, never typed."),
        mol("meal.card", [meal_card("Chana masala", "amber", True), meal_card("Pizza night", "tomato"), meal_card("Eating out", "neutral")], "text.heading · icon.link · text.small · meal colour. 60 tall minimum, radius 20."),
        mol("meal.empty", [meal_empty()], "bullet.add · text.body · dashed line. The whole slot is the tap target."),
        mol("avatar.stack", [sub("avatar.stack--online", avatar_stack(True)), sub("avatar.stack--away", avatar_stack(False))], "avatar.l × 2, overlapped by 10. The tomato ring means the other person is in the app now."),
        mol("toast", [toast(), toast("Shazya planned Pizza night · Friday")], "avatar.s on chartreuse · text.small on ink. Lands from above, stays about 4 seconds."),
        mol("stepper.servings", [sub("stepper.servings--rest", stepper(4)), sub("stepper.servings--min", stepper(1, "disabled-min"))], "button.icon--ghost × 2 · text.heading · text.micro"),
        mol("tab.item", [f'<div style="display: flex; gap: var(--space-6); padding: var(--space-6); border-radius: var(--radius-24); background: var(--color-surface-canvas);">{tab_item("Meal plan", "calendar", "active")}{tab_item("Groceries", "cart", "rest", 14)}</div>', f'<div style="display: flex; gap: var(--space-6); padding: var(--space-6); border-radius: var(--radius-24); background: var(--color-surface-canvas);">{tab_item("Meal plan", "calendar", "pressed")}{tab_item("Groceries", "cart", "focus", 14)}</div>'], "icon · text.body · count.accent. Top row: --active and --rest. Bottom row: --pressed and --focus. 52 tall, radius 18."),
        mol("suggestion.row", [sub("suggestion.row--rest", suggestion_row()), sub("suggestion.row--pressed", suggestion_row("Egg noodles", "Pantry", "pressed"))], "text.label · text.small · button.icon--soft (44 × 44)."),
        mol("week.nav", [week_nav()], "button.icon--ghost × 2 · text.body. Steps one week."),
        mol("status.banner", [sub("status.banner--offline", status_banner("offline")), sub("status.banner--syncing", status_banner("syncing")), sub("status.banner--synced", status_banner("synced"))], "icon · text.small · button.soft. Dashed while changes wait, solid once sent."),
        mol("status.row", [sub("status.row--waiting", status_row("waiting")), sub("status.row--joined", status_row("joined"))], "dot or avatar.l · text.body. Used in the invite card."),
        mol("invite.summary", [invite_summary()], "avatar (64) · text.heading · text.body. The inviter, on the Join screen."),
        mol("tile.day + meal", [f'<div style="display: flex; gap: var(--space-10);">{tile_day("FRI", "23")}<div style="flex: 1; min-width: 0;">{meal_card("Pizza night", "tomato")}</div></div>'], "tile.day · meal.card. One day, one meal. See day.row for two."),
    ]
    body = grid(3, "".join(cards), gap="var(--space-20)")
    write("DS-Molecules.dc.html", 3, "Molecules", "Design system: molecules", "Small groups of atoms that work as one unit. Each card names the atoms it is built from and shows its states.", body)


# =============================================================== 4 ORGANISMS
def organisms():
    def org(name, inner, note, span=""):
        return card(None, nm(name) + inner + cap(note), style=span)
    phone = lambda inner, extra="": f'<div style="width: 390px; max-width: 100%; box-sizing: border-box; background: var(--color-surface-canvas); border-radius: var(--radius-20); {extra}">{inner}</div>'
    def header_main(plan=False):
        top = f'<div style="display: flex; align-items: center; justify-content: space-between;">{week_nav() if plan else "<span class=\"t-body\" style=\"font-weight: var(--weight-heavy); color: var(--color-ink-muted);\">Week of Oct 19</span>"}<span style="display: flex; align-items: center; gap: var(--space-4);">{avatar_stack(True)}<span class="btn btn-s btn-icon btn-text" aria-label="Settings" style="margin-right: calc(-1 * var(--space-12));">{icon("settings", 20)}</span></span></div>'
        title = "This week" if plan else "Groceries"
        mid_l = f'<span class="t-title-l" style="line-height: 1;">{title}</span>' + ("" if plan else progress_bar())
        mid = f'<div style="display: flex; align-items: flex-end; gap: var(--space-12);"><div style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: var(--space-10);">{mid_l}</div>{mascot("shii" if plan else "cremi", 68)}</div>'
        bar = "" if plan else add_bar("rest")
        return phone(f'<div style="padding: var(--space-16) var(--space-20) var(--space-12); display: flex; flex-direction: column; gap: var(--space-10);">{top}{mid}{bar}</div>')
    def header_sub(back=True):
        top = back_link("Meal plan") if back else '<span style="min-height: var(--size-target); display: flex; align-items: center; font-family: var(--font-display); font-size: var(--type-heading); font-weight: var(--weight-bold); color: var(--color-forest);">Grocs</span>'
        return phone(f'<div style="padding: var(--space-16) var(--space-20) var(--space-12); display: flex; flex-direction: column; gap: var(--space-10);">{top}<div style="display: flex; align-items: flex-end; justify-content: space-between; gap: var(--space-12);"><div style="display: flex; flex-direction: column; gap: var(--space-8);">{tag_date("Thursday, Oct 22" if back else "Invite")}<span class="t-title-m" style="line-height: 1.05;">{"Add a meal" if back else "You\'re invited"}</span></div>{mascot("chanty", 68)}</div></div>')
    def list_section():
        return f'<div style="width: 358px; max-width: 100%; display: flex; flex-direction: column; gap: var(--space-8);">{section_header("Pantry", "pantry", 2)}<div style="display: flex; flex-direction: column; gap: var(--space-6);">{item_row("Chickpeas", "2 cans", [badge_meal("Chana masala", "amber")], True)}{item_row("Basmati rice", "2 kg", [], False)}</div></div>'
    def list_empty():
        return f'<div style="width: 358px; max-width: 100%; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; gap: var(--space-12); padding: var(--space-24) var(--space-20); border-radius: var(--radius-24); border: var(--line-w) dashed var(--color-line-dashed); text-align: center;">{mascot("cremi", 68)}<span class="t-heading">Nothing on the list yet</span><span class="t-body" style="color: var(--color-ink-muted);">Add an item, or plan a meal and its ingredients will turn up here.</span><span class="btn btn-m btn-primary" style="align-self: stretch;">Add an item</span></div>'
    def cart_section():
        h = f'<div style="display: flex; align-items: center; gap: var(--space-8); font-family: var(--font-display); font-size: var(--type-heading); font-weight: var(--weight-medium);"><span aria-hidden="true" style="width: var(--size-tile); height: var(--size-tile); border-radius: var(--radius-10); background: var(--color-positive-tint); color: var(--color-forest); display: flex; align-items: center; justify-content: center;">{icon("cart", 18)}</span><span style="flex: 1;">In the cart</span>{count_accent(3)}</div>'
        return f'<div style="width: 358px; max-width: 100%; display: flex; flex-direction: column; gap: var(--space-8);">{h}<div style="display: flex; flex-direction: column; gap: var(--space-6);">{item_row_done("Bananas")}{item_row_done("Coffee beans")}</div><span class="btn btn-s btn-text" style="align-self: center;">Clear the cart</span></div>'
    def celebration():
        return f'<div style="width: 358px; max-width: 100%; box-sizing: border-box; display: flex; align-items: center; gap: var(--space-14); padding: var(--space-14) var(--space-16); border-radius: var(--radius-24); background: var(--color-positive-tint);">{mascot("enoki", 60)}<span style="display: flex; flex-direction: column; gap: var(--space-2);"><span class="t-heading">All done!</span><span class="t-body" style="font-weight: var(--weight-bold); color: var(--color-forest);">Everything&#39;s in the cart.</span></span></div>'
    def day_row(day, num, body_):
        return f'<div style="display: flex; gap: var(--space-10); align-items: stretch;">{tile_day(day, num)}{body_}</div>'
    def week_list():
        wrap = lambda x: f'<div style="flex: 1; min-width: 0;">{x}</div>'
        two = f'<div style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: var(--space-6);">{meal_card("Sheet-pan chicken", "sky", True)}{meal_card("Green salad", "leaf")}</div>'
        return f'<div style="width: 358px; max-width: 100%; display: flex; flex-direction: column; gap: var(--space-10);">{day_row("MON", "19", wrap(meal_card("Chana masala", "amber", True)))}{day_row("TUE", "20", wrap(meal_empty()))}{day_row("WED", "21", two)}</div>'
    def invite_card():
        return f'<div style="width: 358px; max-width: 100%; box-sizing: border-box; display: flex; flex-direction: column; gap: var(--space-14); padding: var(--space-18); border-radius: var(--radius-24); border: var(--line-w) solid var(--color-line-soft); background: var(--color-surface-card);"><div style="display: flex; flex-direction: column; gap: var(--space-4);"><span class="t-heading">Invite your partner</span><span class="t-body" style="color: var(--color-ink-muted);">They get the same plan and list, live on their phone.</span></div>{invite_code()}<div style="display: flex; gap: var(--space-8);"><span class="btn btn-s btn-primary" style="flex: 1;">{icon("share", 18)}Share link</span><span class="btn btn-s btn-secondary" style="flex: 1;">Copy code</span></div>{status_row("waiting")}</div>'
    def recipe_summary():
        return f'<div style="width: 358px; max-width: 100%; box-sizing: border-box; display: flex; align-items: center; justify-content: space-between; gap: var(--space-12); padding: var(--space-12) var(--space-12) var(--space-12) var(--space-16); border-radius: var(--radius-20); background: var(--color-meal-amber);"><span style="display: flex; flex-direction: column; gap: var(--space-4); min-width: 0;"><span style="display: flex; align-items: center; gap: var(--space-6); font-size: var(--type-body); font-weight: var(--weight-heavy);">{icon("check", 16)}Found 12 ingredients</span><span style="display: flex; align-items: center; gap: var(--space-6); font-size: var(--type-small); font-weight: var(--weight-bold); color: var(--color-meal-amber-ink);">{icon("link", 14)}example.com</span></span>{stepper(4)}</div>'
    def auth_sheet():
        return f'<div style="width: 390px; max-width: 100%; box-sizing: border-box; padding: var(--space-24); border-radius: var(--radius-28) var(--radius-28) 0 0; background: var(--color-surface-card); border: var(--line-w) solid var(--color-line-soft); border-bottom: 0; box-shadow: var(--shadow-sheet); display: flex; flex-direction: column; gap: var(--space-16);"><span class="btn btn-m btn-secondary">Continue with Google</span><span class="t-small" style="text-align: center; color: var(--color-ink-muted);">Got an invite? <span style="font-weight: var(--weight-heavy); color: var(--color-forest);">Open it to join</span></span></div>'
    def kitchen_scene():
        def m(w, x, y, s): return f'<g transform="translate({x} {y}) scale({s / 64})">{mascot(w, 64).replace("<svg ", "<g ", 1).replace("</svg>", "</g>")}</g>'
        scene = f'<svg width="358" height="200" viewBox="0 0 358 200" role="img" aria-label="The kitchen: a fridge, a counter with a sink and a stove, and six mushrooms at home in it" style="display: block; max-width: 100%; border-radius: var(--radius-20); background: var(--color-surface-stage);"><rect x="0" y="150" width="358" height="50" fill="var(--color-line-soft)"></rect><rect x="12" y="30" width="62" height="130" rx="8" fill="var(--color-surface-tint)" stroke="var(--color-line)" stroke-width="2"></rect><rect x="84" y="22" width="262" height="46" rx="8" fill="var(--color-meal-amber)"></rect><rect x="84" y="104" width="262" height="48" rx="8" fill="var(--color-meal-amber)"></rect><rect x="78" y="96" width="274" height="12" rx="6" fill="var(--color-surface-card)"></rect>{m("shii", 18, 0, 36)}{m("cremi", 190, 52, 48)}{m("morty", 112, 56, 44)}{m("chanty", 262, 52, 48)}{m("ollie", 130, 14, 30)}{m("enoki", 306, 62, 38)}</svg>'
        return scene
    def nav_org():
        return nav_tabs("plan", "358px")
    body = ""
    items = [
        org("header.main", header_main(False) + header_main(True), "avatar.stack · button.icon--ghost (settings) · text.title-l · progress.bar · mascot · add.bar. Groceries shows the progress and the add bar. Meal plan swaps in week.nav and drops both."),
        org("header.sub", header_sub(True) + header_sub(False), "button.back · tag.date · text.title-m · mascot. The second shows the Join screen: the wordmark replaces the back link, because nothing sits behind it."),
        org("list.section", list_section() + list_empty(), "section.header · item.row × n. Below it, list.empty for a list with nothing on it yet."),
        org("cart.section", cart_section(), "section.header · item.row--done × n · button.text. Appears once something is in the cart."),
        org("celebration.banner", celebration(), "mascot.enoki · text.heading · text.body. Replaces the list header when every item is in the cart."),
        org("week.list", week_list(), "day.row × 7. A day holds one meal, two or more in the order added, or the empty slot."),
        org("day.row", f'<div style="width: 358px; max-width: 100%; display: flex; flex-direction: column; gap: var(--space-14);">{day_row("FRI", "23", f"<div style=\"flex: 1; min-width: 0;\">{meal_card(chr(80)+chr(105)+chr(122)+chr(122)+chr(97)+chr(32)+chr(110)+chr(105)+chr(103)+chr(104)+chr(116), chr(116)+chr(111)+chr(109)+chr(97)+chr(116)+chr(111))}</div>")}{day_row("WED", "21", "<div style=\"flex: 1; min-width: 0; display: flex; flex-direction: column; gap: var(--space-6);\">" + meal_card("Sheet-pan chicken", "sky", True) + meal_card("Green salad", "leaf") + "</div>")}</div>', "tile.day · meal.card × n. The tile stretches to the height of the meals beside it. A dropped meal does not move to the next week."),
        org("invite.card", invite_card(), "text.heading · invite.code · button.primary--s · button.secondary--s · status.row. Your kitchen."),
        org("recipe.summary", recipe_summary(), "icon.check · icon.link · stepper.servings. Parked with recipe import."),
        org("nav.tabs", nav_org(), "tab.item × 2. Floats 20 above the bottom edge. The badge counts items not yet in the cart, the same number the Groceries header shows."),
        org("auth.sheet", auth_sheet(), "button.secondary (Google) · text.small link. Sign-in is Google only."),
        org("kitchen.scene", kitchen_scene(), "A scaled-down stage: six hosts at home in one kitchen. The Welcome screen pans a wider version; each host taps and talks."),
    ]
    body += grid(2, "".join(items), gap="var(--space-24)")
    write("DS-Organisms.dc.html", 4, "Organisms", "Design system: organisms", "Distinct sections of a screen, built from molecules. Shown at phone width (390).", body)


# =============================================================== 5 TEMPLATES
def templates():
    slot = lambda label, h, extra="": f'<div class="ds-slot" style="height: {h}; {extra}">{label}</div>'
    def tpl(name, slots, note):
        frame = f'<div style="width: 220px; height: 476px; box-sizing: border-box; border-radius: var(--radius-28); background: var(--color-surface-canvas); border: var(--line-w) solid var(--color-line); padding: var(--space-10); display: flex; flex-direction: column; gap: var(--space-8); position: relative;">{slots}</div>'
        return f'  <section class="ds-card" style="align-items: center;">\n    <span class="ds-name" style="align-self: flex-start;">{name}</span>\n    {frame}\n    <span class="ds-cap" style="align-self: flex-start;">{note}</span>\n  </section>\n'
    main = tpl("template.main", slot("header.main", "120px", "background: var(--color-surface-tint);") + slot("content<br>list.section, cart.section or week.list", "auto", "flex: 1;") + slot("nav.tabs", "44px", "background: var(--color-surface-card);"), "The two homes. Content scrolls under the floating tab bar; the last row stays clear by the nav clearance token.")
    task = tpl("template.task", slot("header.sub", "100px", "background: var(--color-surface-tint);") + slot("content<br>fields, cards, rows", "auto", "flex: 1;") + slot("action.bar", "40px", "background: var(--color-forest); color: var(--color-on-brand); border-color: var(--color-forest);"), "One job per screen. The back link names the parent. The action bar is optional when the job happens inline.")
    stage = tpl("template.stage", slot("wordmark", "54px") + slot("kitchen.scene<br>mascots living in it", "auto", "flex: 1; background: var(--color-positive-tint);") + slot("auth.sheet", "130px", "background: var(--color-surface-card);"), "First impressions only. The illustration fills the stage; the sheet holds every action.")
    regions = card("Region · action.bar", f'<div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-24); align-items: center;"><div style="display: flex; flex-direction: column; gap: var(--space-8);">{nm("action.bar--primary")}<span class="btn btn-m btn-primary" style="box-shadow: var(--shadow-action);">Add to Thursday</span></div><div style="display: flex; flex-direction: column; gap: var(--space-8);">{nm("action.bar--secondary")}<span class="btn btn-m btn-secondary">Sign out</span></div></div>' + cap("action.bar is a template region, not an organism: one pinned button, 16 from each side and 24 from the bottom. 56 tall, radius 20. Primary carries the action shadow; a secondary action (Sign out) keeps its soft lip."))
    rows = [
        ("Welcome", "template.stage", "kitchen.scene, auth.sheet", "Whole cast"),
        ("Your kitchen", "template.task", "header.sub, field.labelled, invite.card, action.bar", "Enoki"),
        ("Join from an invite", "template.task", "header.sub (wordmark, no back link), invite.summary, one Google button (no action bar)", "Chanty"),
        ("Join from an invite: invalid code", "template.task", "header.sub, field.labelled--error, button.primary, button.text", "Chanty"),
        ("Meal plan", "template.main", "header.main (week.nav), week.list, nav.tabs", "Shii"),
        ("Add a meal", "template.task", "header.sub, field.labelled × 2, action.bar", "Chanty"),
        ("Groceries", "template.main", "header.main, toast, list.section × n, cart.section, celebration.banner, nav.tabs", "Cremi, enoki when done"),
        ("Add an item", "template.task", "header.sub, add field (input.text--focus plus button.primary--s), chip.group, suggestion.row × n", "Ollie"),
        ("Settings", "template.task", "header.sub, settings cards (switch, button.secondary--s), action.bar--secondary", "Morty"),
        ("Offline, waiting to send", "template.main", "header.main, status.banner, list.section × n (tag.sync), nav.tabs", "Ollie"),
        ("In-app toast", "template.main", "header.main, toast, list.section × n, nav.tabs", "Cremi"),
        ("Parked: recipe import", "template.task", "header.sub, recipe.summary, item.row × n (no section header), action.bar", "Morty"),
    ]
    tbl = '<table class="ds-table"><thead><tr><th>Page</th><th>Template</th><th>Parts</th><th>Host</th></tr></thead><tbody>' + "".join(f"<tr><td>{a}</td><td>{b}</td><td>{c}</td><td>{d}</td></tr>" for a, b, c, d in rows) + "</tbody></table>"
    body = grid(3, main + task + stage) + regions + card("Pages", tbl)
    write("DS-Templates.dc.html", 5, "Templates and pages", "Design system: templates and pages", "Three layouts hold every screen. Pages are templates filled with real content.", body)


if __name__ == "__main__":
    which = sys.argv[1:] or ["tokens", "atoms", "molecules", "organisms", "templates"]
    for w in which:
        globals()[w]()
