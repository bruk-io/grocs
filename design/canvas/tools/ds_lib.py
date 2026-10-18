import os
"""Shared building blocks for the design-system boards. Every repeated part is defined once here,
so the Atoms, Molecules and Organisms boards draw the identical markup."""
import re

P = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..") + "/"


def read(n):
    return open(P + n).read()


# ---------------------------------------------------------------- mascots (extracted from the host screens)
HOSTS = {
    "cremi": "Main.dc.html", "shii": "Plan.dc.html", "chanty": "AddMeal.dc.html",
    "ollie": "QuickAdd.dc.html", "morty": "RecipeImport.dc.html", "enoki": "Household.dc.html",
}


def mascot(who, size=64):
    src = read(HOSTS[who])
    m = re.search(r'<svg width="\d+" height="\d+" viewBox="0 0 64 64"[^>]*>.*?</svg>', src[src.index('class="mascot-btn"'):], re.S)
    if who == "enoki":
        src2 = src[src.index('class="mascot-btn"'):]
        m = re.search(r'<svg width="\d+" height="\d+" viewBox="0 0 64 64"[^>]*>.*?</svg>', src2, re.S)
    svg = m.group(0)
    svg = re.sub(r'<g class="shii-eyes-open">.*?</g>', "", svg, flags=re.S)
    svg = re.sub(r"<text .*?</text>\s*", "", svg, flags=re.S)
    svg = re.sub(r'\s*class="[^"]*"', "", svg)
    svg = re.sub(r'^<svg width="\d+" height="\d+"', f'<svg width="{size}" height="{size}"', svg)
    svg = re.sub(r"\n\s*", "", svg)
    return svg


# ---------------------------------------------------------------- icons (24 grid, one 2px stroke)
ICON_PATHS = {
    "produce": '<path d="M5 19l9-11a3 3 0 0 1 4 4l-11 9z"></path><path d="M16 7l2-3M18 9l3-1M17 8l3-3"></path>',
    "meat": '<path d="M15 3a6 6 0 0 1 6 6c0 4-4 6-7 6l-3 3a2 2 0 1 1-3 1 2 2 0 1 1 1-3l3-3c0-3 1-10 3-10z"></path>',
    "dairy": '<path d="M8 3h8l2 4v14H6V7z"></path><path d="M6 7h12M10 13h4"></path>',
    "bakery": '<path d="M4 11a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4 2 2 0 0 1-1 2v6H5v-6a2 2 0 0 1-1-2z"></path><path d="M9 11v3M12 11v3M15 11v3"></path>',
    "pantry": '<path d="M8 3h8v3H8z"></path><path d="M7 6h10a1 1 0 0 1 1 1v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7a1 1 0 0 1 1-1z"></path><path d="M6 11h12"></path>',
    "cart": '<path d="M3 4h2l2.4 11.2a1 1 0 0 0 .8.8h8.9a1 1 0 0 0 1-.8L20 8H6.2"></path><circle cx="9" cy="20" r="1.4"></circle><circle cx="17" cy="20" r="1.4"></circle>',
    "calendar": '<rect x="4" y="5" width="16" height="15" rx="3"></rect><path d="M4 10h16M9 3v4M15 3v4"></path>',
    "link": '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"></path><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"></path>',
    "share": '<path d="M12 15V3M7 8l5-5 5 5"></path><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"></path>',
    "back": '<path d="M15 5l-7 7 7 7"></path>',
    "forward": '<path d="M9 5l7 7-7 7"></path>',
    "add": '<path d="M12 5v14M5 12h14"></path>',
    "remove": '<path d="M5 12h14"></path>',
    "check": '<path d="M5 12.5l4.5 4.5L19 7.5"></path>',
    "settings": None,  # filled below from common.py
    "clock": '<circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path>',
    "cloud-off": '<path d="M3 3l18 18"></path><path d="M9.5 5.2A6 6 0 0 1 18 9.3a4.5 4.5 0 0 1 3 7.4M6.3 7.3A5.5 5.5 0 0 0 7 18.5h10"></path>',
    "alert": '<circle cx="12" cy="12" r="9"></circle><path d="M12 7.5v5.5M12 16.5v.01"></path>',
    "copy": '<rect x="9" y="9" width="11" height="11" rx="2"></rect><path d="M5 15V6a2 2 0 0 1 2-2h9"></path>',
}
_g = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "common.py")).read()
ICON_PATHS["settings"] = re.search(r'<circle cx="12" cy="12" r="3"></circle><path d="[^"]*"></path>', _g).group(0)


def icon(name, size=20, extra=""):
    return f'<svg class="icon" width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"{extra}>{ICON_PATHS[name]}</svg>'


# ---------------------------------------------------------------- atoms
TAG = "font-size: var(--type-micro); font-weight: var(--weight-heavy); padding: var(--space-4) var(--space-10); border-radius: var(--radius-pill);"


def badge_meal(label, kind):
    return f'<span style="{TAG} background: var(--color-meal-{kind}); color: var(--color-meal-{kind}-ink);">{label}</span>'


def tag_status(label):
    return f'<span style="{TAG} background: var(--color-positive-tint); color: var(--color-forest);">{label}</span>'


def tag_neutral(label):
    return f'<span style="{TAG} background: var(--color-tag-neutral); color: var(--color-tag-neutral-ink);">{label}</span>'


def tag_new():
    return f'<span style="{TAG} background: var(--color-chartreuse); color: var(--color-ink);">New</span>'


def tag_sync(label="Waiting to send"):
    return f'<span style="display: flex; align-items: center; gap: var(--space-4); {TAG} background: var(--color-tag-neutral); color: var(--color-tag-neutral-ink);">{icon("clock", 12)}{label}</span>'


def tag_date(label):
    return f'<span style="align-self: flex-start; padding: var(--space-4) var(--space-10); border-radius: var(--radius-pill); background: var(--color-surface-tint); color: var(--color-ink-on-tint); font-size: var(--type-small); font-weight: var(--weight-heavy);">{label}</span>'


def count_neutral(n):
    return f'<span style="min-width: var(--size-count); height: var(--size-count); padding: 0 var(--space-6); box-sizing: border-box; border-radius: var(--radius-pill); background: var(--color-surface-card); border: var(--line-w) solid var(--color-line); display: flex; align-items: center; justify-content: center; font-family: var(--font-body); font-size: var(--type-caption); font-weight: var(--weight-heavy); color: var(--color-ink-muted);">{n}</span>'


def count_accent(n):
    return f'<span style="min-width: var(--size-badge); height: var(--size-badge); padding: 0 var(--space-6); box-sizing: border-box; border-radius: var(--radius-pill); background: var(--color-chartreuse); color: var(--color-ink); display: flex; align-items: center; justify-content: center; font-size: var(--type-caption); font-weight: var(--weight-heavy);">{n}</span>'


def avatar_l(letter, who="B", online=False, ring="canvas", overlap=False):
    bg = "forest" if who == "B" else "chartreuse"
    fg = "on-brand" if who == "B" else "ink"
    ml = " margin-left: calc(-1 * var(--space-10));" if overlap else ""
    pulse = '<span aria-hidden="true" style="position: absolute; inset: -4px; border-radius: 50%; border: var(--line-w) solid var(--color-tomato);"></span>' if online else ""
    return f'<span style="position: relative; width: var(--size-avatar-l); height: var(--size-avatar-l);{ml} box-sizing: border-box; border-radius: 50%; border: var(--line-w-strong) solid var(--color-surface-{ring}); background: var(--color-{bg}); color: var(--color-{fg}); display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-size: var(--type-body); font-weight: var(--weight-medium);">{pulse}<span aria-hidden="true">{letter}</span></span>'


def avatar_s(letter="S"):
    return f'<span style="width: var(--size-avatar-s); height: var(--size-avatar-s); flex: none; border-radius: 50%; background: var(--color-surface-tint); color: var(--color-ink-on-tint); display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-size: var(--type-caption); font-weight: var(--weight-medium);"><span aria-hidden="true">{letter}</span></span>'


def tile_day(day, num, h="var(--size-row)"):
    return f'<span style="width: var(--size-day-tile); min-height: {h}; flex: none; box-sizing: border-box; border-radius: var(--radius-16); background: var(--color-surface-card); border: var(--line-w) solid var(--color-line); display: flex; flex-direction: column; align-items: center; justify-content: center;"><span style="font-size: var(--type-micro); font-weight: var(--weight-heavy); letter-spacing: var(--tracking-caps); color: var(--color-ink-muted);">{day}</span><span style="font-family: var(--font-display); font-size: var(--type-heading); font-weight: var(--weight-medium); line-height: 1.1;">{num}</span></span>'


def check(state="off"):
    if state == "off":
        return '<span aria-hidden="true" style="width: var(--size-check); height: var(--size-check); flex: none; box-sizing: border-box; border-radius: 50%; border: var(--line-w-strong) solid var(--color-forest);"></span>'
    if state == "disabled":
        return '<span aria-hidden="true" style="width: var(--size-check); height: var(--size-check); flex: none; box-sizing: border-box; border-radius: 50%; border: var(--line-w-strong) solid var(--color-line); background: var(--color-disabled);"></span>'
    sparks = ""
    if state == "ticking":
        for dx, dy, c in [(15, -12, "chartreuse"), (-15, -11, "chartreuse"), (17, 8, "tomato"), (-16, 9, "water"), (2, -19, "tomato"), (-1, 18, "chartreuse")]:
            sparks += f'<span aria-hidden="true" style="position: absolute; left: 50%; top: 50%; width: 7px; height: 7px; margin: -3.5px 0 0 -3.5px; border-radius: 50%; transform: translate({dx}px, {dy}px); background: var(--color-{c});"></span>'
    return f'<span aria-hidden="true" style="position: relative; width: var(--size-check); height: var(--size-check); flex: none; border-radius: 50%; background: var(--color-forest); color: var(--color-on-brand); display: flex; align-items: center; justify-content: center;">{icon("check", 15)}{sparks}</span>'


def speech_bubble(text, tail="right"):
    return f'<span style="position: relative; align-self: flex-start; max-width: var(--size-bubble); padding: var(--space-10) var(--space-12); border-radius: var(--radius-16); background: var(--color-surface-card); border: var(--line-w) solid var(--color-line); box-shadow: var(--shadow-float); font-size: var(--type-small); font-weight: var(--weight-bold); line-height: 1.3; color: var(--color-ink);">{text}<span style="position: absolute; right: -8px; top: 16px; width: var(--size-dot); height: var(--size-dot); background: var(--color-surface-card); border-right: var(--line-w) solid var(--color-line); border-top: var(--line-w) solid var(--color-line); transform: rotate(45deg);"></span></span>'


def invite_code(code="MOREL-24"):
    return f'<span style="display: flex; flex-direction: column; align-items: center; gap: var(--space-4); padding: var(--space-14); border-radius: var(--radius-18); background: var(--color-surface-canvas); border: var(--line-w) dashed var(--color-line-dashed);"><span style="font-size: var(--type-caption); font-weight: var(--weight-heavy); letter-spacing: var(--tracking-code); text-transform: uppercase; color: var(--color-ink-muted);">Invite code</span><span style="font-family: var(--font-display); font-size: var(--type-title-m); font-weight: var(--weight-bold); letter-spacing: var(--tracking-code); color: var(--color-forest);">{code}</span></span>'


def switch(state="off"):
    cls = {"off": "", "on": " is-on", "focus": " is-focus", "disabled": " is-disabled", "disabled-on": " is-on is-disabled"}[state]
    return f'<span aria-hidden="true" class="switch{cls}"><span class="switch-knob"></span></span>'


def spinner(color="forest"):
    return f'<span aria-hidden="true" class="btn-spinner" style="color: var(--color-{color});"></span>'


# ---------------------------------------------------------------- molecules
def item_row(name="Yellow onions", qty="2", tags=None, avatar=True, state="rest"):
    tags = tags if tags is not None else [badge_meal("Chana masala", "amber"), badge_meal("Sheet-pan chicken", "sky")]
    cls = "press is-pressed" if state == "pressed" else "press"
    bg = "surface-tint" if state == "pressed" else "surface-card"
    return f'<div class="{cls}" style="min-height: var(--size-row); box-sizing: border-box; display: flex; align-items: center; gap: var(--space-14); padding: var(--space-10) var(--space-14); border: var(--line-w) solid var(--color-line-soft); border-radius: var(--radius-20); background: var(--color-{bg});">{check("off")}<span style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: var(--space-6);"><span class="t-label" style="align-self: flex-start;">{name}</span><span style="display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-6);"><span class="t-small" style="color: var(--color-ink-muted);">{qty}</span>{"".join(tags)}</span></span>{avatar_s("S") if avatar else ""}</div>'


def item_row_done(name="Coffee beans"):
    return f'<div style="min-height: var(--size-row-done); box-sizing: border-box; display: flex; align-items: center; gap: var(--space-14); padding: var(--space-8) var(--space-14); border: var(--line-w) dashed var(--color-line-done); border-radius: var(--radius-20); background: var(--color-surface-done); color: var(--color-done-ink);">{check("on")}<span style="flex: 1; min-width: 0; font-size: var(--type-body); font-weight: var(--weight-bold); text-decoration: line-through;">{name}</span></div>'


def item_row_swiped(name="Oat milk"):
    return f'<div style="position: relative; border-radius: var(--radius-20); background: var(--color-error-tint); overflow: hidden;"><span style="position: absolute; right: 0; top: 0; bottom: 0; width: 88px; display: flex; align-items: center; justify-content: center; gap: var(--space-4); color: var(--color-error); font-size: var(--type-small); font-weight: var(--weight-heavy);">Remove</span><div style="margin-right: 88px; min-height: var(--size-row); box-sizing: border-box; display: flex; align-items: center; gap: var(--space-14); padding: var(--space-10) var(--space-14); border: var(--line-w) solid var(--color-line-soft); border-radius: var(--radius-20); background: var(--color-surface-card);">{check("off")}<span style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: var(--space-6);"><span class="t-label">{name}</span><span class="t-small" style="color: var(--color-ink-muted);">1 carton</span></span></div></div>'


def item_row_loading():
    bar = lambda w, h, extra="": f'<span class="shimmer" style="width: {w}; height: {h}; border-radius: var(--radius-pill); background: var(--color-line-soft);{extra}"></span>'
    return f'<div aria-busy="true" style="min-height: var(--size-row); box-sizing: border-box; display: flex; align-items: center; gap: var(--space-14); padding: var(--space-10) var(--space-14); border: var(--line-w) solid var(--color-line-soft); border-radius: var(--radius-20); background: var(--color-surface-card);"><span class="shimmer" style="width: var(--size-check); height: var(--size-check); flex: none; border-radius: 50%; background: var(--color-line-soft);"></span><span style="flex: 1; display: flex; flex-direction: column; gap: var(--space-8);">{bar("55%", "var(--space-12)")}{bar("30%", "var(--space-10)")}</span></div>'


def add_bar(state="rest", value=""):
    cls = "field-box is-focus" if state == "focus" else "field-box"
    inner = f'<span style="flex: 1; min-width: 0; height: var(--size-target); display: flex; align-items: center; font-size: var(--type-label); font-weight: var(--weight-medium); color: var(--color-{"ink" if value else "ink-hint"});">{value or "Add an item…"}</span>'
    return f'<div class="{cls}" style="display: flex; gap: var(--space-8); align-items: center; border-radius: var(--radius-20); padding: var(--space-4) var(--space-4) var(--space-4) var(--space-18);">{inner}<span class="btn btn-s btn-icon btn-primary" aria-hidden="true">{icon("add", 20)}</span></div>'


def input_text(state="rest", value=None, placeholder="Paste a link", id_="x"):
    cls = {"rest": "field-box", "focus": "field-box is-focus", "filled": "field-box", "error": "field-box is-error", "disabled": "field-box is-disabled"}[state]
    val = value if value is not None else ("Fried rice" if state in ("filled", "focus", "error") else "")
    dis = " disabled" if state == "disabled" else ""
    ph = f' placeholder="{placeholder}"' if not val else ""
    v = f' value="{val}"' if val else ""
    inv = ' aria-invalid="true"' if state == "error" else ""
    return f'<input id="{id_}" class="{cls}" type="text"{v}{ph}{dis}{inv} style="width: 100%; height: var(--size-control); box-sizing: border-box; padding: 0 var(--space-18); border-radius: var(--radius-20); outline: none; font: inherit; font-size: var(--type-label); font-weight: var(--weight-bold); color: var(--color-{"disabled-ink" if state == "disabled" else "ink"});">'


def meal_card(title, kind, link=False):
    meta = f'<span style="display: flex; align-items: center; gap: var(--space-6); font-size: var(--type-small); font-weight: var(--weight-bold); color: var(--color-meal-{kind}-ink);">{icon("link", 14)}example.com</span>' if link else ""
    ink = " color: var(--color-tag-neutral-ink);" if kind == "neutral" else ""
    bg = "tag-neutral" if kind == "neutral" else f"meal-{kind}"
    return f'<div style="min-width: 0; min-height: var(--size-row); box-sizing: border-box; display: flex; flex-direction: column; justify-content: center; gap: var(--space-6); padding: var(--space-12) var(--space-16); border-radius: var(--radius-20); background: var(--color-{bg});"><span style="font-family: var(--font-display); font-size: var(--type-heading); font-weight: var(--weight-medium);{ink}">{title}</span>{meta}</div>'


def meal_empty():
    return f'<span style="min-height: var(--size-row); box-sizing: border-box; display: flex; align-items: center; gap: var(--space-10); padding: 0 var(--space-16); border-radius: var(--radius-20); border: var(--line-w) dashed var(--color-line-dashed); color: var(--color-ink); font-size: var(--type-body); font-weight: var(--weight-heavy);"><span aria-hidden="true" style="width: var(--size-bullet); height: var(--size-bullet); border-radius: 50%; background: var(--color-forest); color: var(--color-on-brand); display: flex; align-items: center; justify-content: center;">{icon("add", 14)}</span>Plan a meal</span>'


def section_header(name="Produce", ic="produce", n=6):
    return f'<div style="display: flex; align-items: center; gap: var(--space-8); font-family: var(--font-display); font-size: var(--type-heading); font-weight: var(--weight-medium);"><span aria-hidden="true" style="width: var(--size-tile); height: var(--size-tile); border-radius: var(--radius-10); background: var(--color-surface-tint); color: var(--color-forest); display: flex; align-items: center; justify-content: center;">{icon(ic, 18)}</span><span style="flex: 1;">{name}</span>{count_neutral(n)}</div>'


def progress_bar(pct=18, remaining=14, cart=3):
    return f'<div style="display: flex; flex-direction: column; gap: var(--space-6);"><div style="display: flex; justify-content: space-between; font-size: var(--type-small); font-weight: var(--weight-heavy); color: var(--color-ink-muted);"><span>{remaining} to go</span><span>{cart} in the cart</span></div><div role="progressbar" aria-label="Shopping progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="{pct}" style="height: var(--size-meter); border-radius: var(--radius-pill); background: var(--color-line-soft); overflow: hidden;"><div style="height: 100%; width: {pct}%; border-radius: var(--radius-pill); background: var(--color-forest);"></div></div></div>'


def avatar_stack(online=True):
    return f'<span style="display: flex;">{avatar_l("B", "B")}{avatar_l("S", "S", online=online, overlap=True)}</span>'


def toast(text="Shazya added Oat milk · just now"):
    return f'<span style="align-self: flex-start; display: flex; align-items: center; gap: var(--space-8); padding: var(--space-6) var(--space-14) var(--space-6) var(--space-6); border-radius: var(--radius-pill); background: var(--color-ink); color: var(--color-on-brand); font-size: var(--type-small); font-weight: var(--weight-bold);"><span aria-hidden="true" style="width: var(--size-avatar-s); height: var(--size-avatar-s); border-radius: 50%; background: var(--color-chartreuse); color: var(--color-ink); display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-size: var(--type-caption); font-weight: var(--weight-medium);">S</span><span>{text}</span></span>'


def stepper(n=4, state="rest"):
    dis = state == "disabled-min"
    c1 = "disabled-ink" if dis else "forest"
    return f'<span role="group" aria-label="Servings" style="align-self: flex-start; display: flex; align-items: center; background: var(--color-surface-card); border-radius: var(--radius-18);"><span class="btn btn-s btn-icon btn-text{" is-disabled" if dis else ""}" style="background: transparent; color: var(--color-{c1});">{icon("remove", 16)}</span><span style="min-width: 30px; text-align: center; display: flex; flex-direction: column; line-height: 1.1;"><span style="font-family: var(--font-display); font-size: var(--type-heading); font-weight: var(--weight-medium);">{n}</span><span style="font-size: var(--type-micro); font-weight: var(--weight-heavy); color: var(--color-ink-muted);">serves</span></span><span class="btn btn-s btn-icon btn-text">{icon("add", 16)}</span></span>'


def tab_item(label, ic, state="active", badge=None):
    if state == "active":
        st = "background: var(--color-forest); color: var(--color-on-brand);"
    elif state == "pressed":
        st = "background: var(--color-surface-tint); color: var(--color-ink);"
    elif state == "focus":
        st = "color: var(--color-ink); outline: 3px solid var(--color-forest); outline-offset: -3px;"
    else:
        st = "color: var(--color-ink);"
    b = count_accent(badge) if badge else ""
    return f'<span style="flex: 1; height: var(--size-tab); border-radius: var(--radius-18); display: flex; align-items: center; justify-content: center; gap: var(--space-8); {st} font-size: var(--type-body); font-weight: var(--weight-heavy);">{icon(ic, 20)}{label}{b}</span>'


def nav_tabs(active="plan", width="100%"):
    return f'<span style="width: {width}; box-sizing: border-box; display: flex; gap: var(--space-6); padding: var(--space-6); border-radius: var(--radius-24); background: var(--color-surface-card); border: var(--line-w) solid var(--color-line); box-shadow: var(--shadow-nav);">{tab_item("Meal plan", "calendar", "active" if active == "plan" else "rest")}{tab_item("Groceries", "cart", "active" if active == "groceries" else "rest", 14)}</span>'


def suggestion_row(name="Eggs", meta="Dairy &amp; eggs · usually 1 dozen", state="rest"):
    cls = "press is-pressed" if state == "pressed" else "press"
    bg = "surface-tint" if state == "pressed" else "surface-card"
    return f'<div class="{cls}" style="min-height: var(--size-row); box-sizing: border-box; display: flex; align-items: center; gap: var(--space-12); padding: var(--space-8) var(--space-10) var(--space-8) var(--space-16); border: var(--line-w) solid var(--color-line-soft); border-radius: var(--radius-20); background: var(--color-{bg});"><span style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: var(--space-2);"><span class="t-label">{name}</span><span class="t-small" style="color: var(--color-ink-muted);">{meta}</span></span><span class="btn btn-s btn-icon btn-soft" aria-hidden="true">{icon("add", 18)}</span></div>'


def status_banner(kind="offline"):
    if kind == "offline":
        bg, bd, ic, txt, right = "surface-done", "dashed var(--color-line-done)", icon("cloud-off", 18), "Offline. 2 changes waiting.", '<span class="btn btn-s btn-soft">Try again</span>'
    elif kind == "syncing":
        bg, bd, ic, txt, right = "surface-done", "dashed var(--color-line-done)", spinner(), "Sending 2 changes…", '<span class="btn btn-s btn-soft is-disabled is-loading">Sending</span>'
    else:
        bg, bd, ic, txt, right = "positive-tint", "solid transparent", f'<span style="color: var(--color-forest); display: flex;">{icon("check", 18)}</span>', "Back online. Everything is sent.", ""
    return f'<div style="display: flex; align-items: center; gap: var(--space-10); padding: var(--space-6) var(--space-6) var(--space-6) var(--space-14); min-height: var(--size-target); box-sizing: border-box; border-radius: var(--radius-16); background: var(--color-{bg}); border: var(--line-w) {bd}; color: var(--color-ink-soft); font-size: var(--type-small); font-weight: var(--weight-bold);">{ic}<span style="flex: 1; min-width: 0;">{txt}</span>{right}</div>'


def status_row(kind="waiting"):
    if kind == "waiting":
        return f'<div style="display: flex; align-items: center; gap: var(--space-12); padding: var(--space-10) var(--space-12); border-radius: var(--radius-16); background: var(--color-surface-done);"><span aria-hidden="true" style="position: relative; width: var(--size-dot); height: var(--size-dot); margin: 0 var(--space-6);"><span style="position: absolute; inset: 0; border-radius: 50%; background: var(--color-tomato);"></span></span><span style="font-size: var(--type-body); font-weight: var(--weight-bold); color: var(--color-ink-muted);">Link sent. Waiting for them to join…</span></div>'
    return f'<div style="display: flex; align-items: center; gap: var(--space-12); padding: var(--space-10) var(--space-12); border-radius: var(--radius-16); background: var(--color-positive-tint);"><span style="width: var(--size-avatar-l); height: var(--size-avatar-l); flex: none; border-radius: 50%; background: var(--color-chartreuse); color: var(--color-ink); display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-size: var(--type-body); font-weight: var(--weight-medium);"><span aria-hidden="true">S</span></span><span style="flex: 1; font-size: var(--type-body); font-weight: var(--weight-heavy); color: var(--color-forest);">Shazya joined your kitchen!</span></div>'


def week_nav():
    b = lambda ic, lab: f'<span class="btn btn-s btn-icon btn-text" aria-label="{lab}" style="width: var(--size-target); border-radius: var(--radius-14);">{icon(ic, 20)}</span>'
    return f'<span style="display: flex; align-items: center;">{b("back", "Previous week")}<span style="font-size: var(--type-body); font-weight: var(--weight-heavy); color: var(--color-ink-muted);">Oct 19 - 25</span>{b("forward", "Next week")}</span>'


def back_link(label="Meal plan"):
    return f'<span style="align-self: flex-start; min-height: var(--size-target); padding: 0 var(--space-12) 0 var(--space-4); display: flex; align-items: center; gap: var(--space-2); border-radius: var(--radius-14); color: var(--color-forest); font-size: var(--type-body); font-weight: var(--weight-heavy);">{icon("back", 22)}{label}</span>'


def invite_summary():
    return f'<div style="display: flex; flex-direction: column; align-items: center; gap: var(--space-12); padding: var(--space-24) var(--space-20); border-radius: var(--radius-24); background: var(--color-surface-card); border: var(--line-w) solid var(--color-line-soft); text-align: center;"><span style="width: var(--size-avatar-xl); height: var(--size-avatar-xl); border-radius: 50%; background: var(--color-forest); color: var(--color-on-brand); display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-size: var(--type-title-m); font-weight: var(--weight-medium);">B</span><span style="font-family: var(--font-display); font-size: var(--type-heading); font-weight: var(--weight-medium); line-height: 1.2;">Bruk invited you to<br>Our kitchen</span><span class="t-body" style="color: var(--color-ink-muted);">Plan the week\'s meals together and shop from one shared list, live on both phones.</span></div>'
