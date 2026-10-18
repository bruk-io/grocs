import os
import re
P = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..") + "/"


def read(n):
    return open(P + n).read()


def body_of(n):
    return re.search(r"</helmet>\n(.*)</x-dc>", read(n), re.S).group(1)


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
MID = '''</x-dc>
<script type="text/x-dc" data-dc-script data-props='{{"$preview":{{"width":{w},"height":{h}}}}}'>
'''
TAIL = '''</script>
</body>
</html>
'''
ROOT = '<div style="width: 390px; height: 844px; box-sizing: border-box; position: relative; overflow: hidden; display: flex; flex-direction: column; background: var(--color-surface-canvas); color: var(--color-ink); font-family: var(--font-body);">\n'

HOST_RE = re.compile(r'      <div style="position: relative; flex: none;">\n.*?        </sc-if>\n      </div>\n', re.S)


def host_of(n):
    m = HOST_RE.search(read(n))
    assert m, n
    return m.group(0)


POKE_JS = '''  componentWillUnmount() { clearTimeout(this.rt); clearTimeout(this.tt); {extra}}
  poke() {
    var self = this;
    var n = this.state.pk + 1;
    this.setState({ pk: n, react: n % 2 ? '@WHO@-a' : '@WHO@-b', talking: true });
    clearTimeout(this.rt); clearTimeout(this.tt);
    this.rt = setTimeout(function () { self.setState({ react: '' }); }, 1300);
    this.tt = setTimeout(function () { self.setState({ talking: false }); }, 2800);
  }
'''

ICON = lambda d, size=20: f'<svg class="icon" width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{d}</svg>'
BACK = ICON('<path d="M15 5l-7 7 7 7"></path>', 22)
CLOCK = '<circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path>'
CHECK = '<path d="M5 12.5l4.5 4.5L19 7.5"></path>'
ALERT = '<circle cx="12" cy="12" r="9"></circle><path d="M12 7.5v5.5M12 16.5v.01"></path>'
CLOUDOFF = '<path d="M3 3l18 18"></path><path d="M9.5 5.2A6 6 0 0 1 18 9.3a4.5 4.5 0 0 1 3 7.4M6.3 7.3A5.5 5.5 0 0 0 7 18.5h10"></path>'
COPY = '<rect x="9" y="9" width="11" height="11" rx="2"></rect><path d="M5 15V6a2 2 0 0 1 2-2h9"></path>'


def sub_header(host, back_href, back_label, tag, h1):
    """header.sub: back link, context tag, title and the screen's host mascot."""
    return f'''  <header style="padding: var(--space-16) var(--space-20) var(--space-12); display: flex; flex-direction: column; gap: var(--space-10);">
    <a href="{back_href}" style="align-self: flex-start; margin-left: calc(-1 * var(--space-10)); min-height: var(--size-target); padding: 0 var(--space-12) 0 var(--space-4); display: flex; align-items: center; gap: var(--space-2); border-radius: var(--radius-14); color: var(--color-forest); text-decoration: none; font-size: var(--type-body); font-weight: var(--weight-heavy);">
      {BACK}
      {back_label}
    </a>
    <div style="display: flex; align-items: flex-end; justify-content: space-between; gap: var(--space-12);">
      <div style="display: flex; flex-direction: column; gap: var(--space-8); min-width: 0;">
        <span style="align-self: flex-start; padding: var(--space-4) var(--space-10); border-radius: var(--radius-pill); background: var(--color-surface-tint); color: var(--color-ink-on-tint); font-size: var(--type-small); font-weight: var(--weight-heavy);">{tag}</span>
        <h1 style="margin: 0; font-family: var(--font-display); font-size: var(--type-title-m); font-weight: var(--weight-bold); line-height: 1.05;">{h1}</h1>
      </div>
{host}    </div>
  </header>
  <span role="status" class="sr">{{{{liveLine}}}}</span>
'''


def card(inner, delay=0, extra=""):
    return f'''    <section class="rise" style="display: flex; flex-direction: column; gap: var(--space-14); padding: var(--space-18); border-radius: var(--radius-24); background: var(--color-surface-card); border: var(--line-w) solid var(--color-line-soft); animation-delay: {delay}ms;{extra}">
{inner}
    </section>
'''


def card_head(title, text):
    return f'''      <div style="display: flex; flex-direction: column; gap: var(--space-4);">
        <h2 style="margin: 0; font-family: var(--font-display); font-size: var(--type-heading); font-weight: var(--weight-medium);">{title}</h2>
        <p style="margin: 0; font-size: var(--type-body); font-weight: var(--weight-medium); color: var(--color-ink-muted);">{text}</p>
      </div>'''


# ------------------------------------------------------------------ Settings
def settings():
    host = host_of("RecipeImport.dc.html")
    out = HEAD.format(title="Settings") + ROOT
    out += sub_header(host, "Main.dc.html", "Groceries", "Signed in with Google", "Settings")
    out += '  <main style="flex: 1; min-height: 0; overflow-y: auto; padding: var(--space-8) var(--space-20) var(--size-nav-clearance); display: flex; flex-direction: column; gap: var(--space-24);">\n'
    out += card(card_head("Notifications", "Off by default. We only nudge you when Shazya adds to the plan or the list.") + f'''
      <label for="set-notify" style="min-height: var(--size-control); box-sizing: border-box; display: flex; align-items: center; justify-content: space-between; gap: var(--space-14); padding: 0 var(--space-14); border-radius: var(--radius-16); background: var(--color-surface-canvas); cursor: pointer; font-size: var(--type-label); font-weight: var(--weight-heavy);">
        <input id="set-notify" class="switch-input sr" type="checkbox" role="switch" checked="{{{{notifyOn}}}}" onChange="{{{{toggleNotify}}}}">
        <span>Tell me when Shazya adds something</span>
        <span aria-hidden="true" class="switch {{{{switchClass}}}}"><span class="switch-knob"></span></span>
      </label>
      <span role="status" class="sr">{{{{notifyLine}}}}</span>''', 80)
    out += card(card_head("Diagnostics", "Copies the app version and sync status. Nothing from your lists or plans.") + f'''
      <button class="btn btn-s btn-secondary" onClick="{{{{copyDiag}}}}">{ICON(COPY, 18)}{{{{diagLabel}}}}</button>''', 160)
    out += card(f'''      <div style="display: flex; align-items: center; gap: var(--space-14);">
        <span style="width: var(--size-avatar-l); height: var(--size-avatar-l); flex: none; border-radius: 50%; background: var(--color-forest); color: var(--color-on-brand); display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-size: var(--type-body); font-weight: var(--weight-medium);"><span aria-hidden="true">B</span></span>
        <span style="display: flex; flex-direction: column; min-width: 0;">
          <span style="font-size: var(--type-label); font-weight: var(--weight-heavy);">Bruk</span>
          <span style="font-size: var(--type-small); font-weight: var(--weight-medium); color: var(--color-ink-muted);">you@example.com · Our kitchen</span>
        </span>
      </div>''', 240)
    out += '  </main>\n\n'
    out += '''  <div style="position: absolute; left: var(--space-16); right: var(--space-16); bottom: var(--space-24); display: flex;">
    <a class="btn btn-m btn-secondary" href="Welcome.dc.html" style="flex: 1;">Sign out</a>
  </div>
</div>
'''
    out += MID.format(w=390, h=844)
    out += '''class Component extends DCLogic {
  constructor(props) {
    super(props);
    this.state = { notify: false, copied: false, pk: 0, react: '', talking: false };
  }
''' + (POKE_JS.replace("@WHO@", "morty-tap")).replace("{extra}", "clearTimeout(this.ct); ") + '''  renderVals() {
    var self = this;
    var lines = [
      'Diagnostics? My favourite kind of fun.',
      'Notifications are off. Peace and quiet.',
      "Fun fact: I'm mostly holes.",
      'Signing out? Come back soon.'
    ];
    var line = lines[(Math.max(this.state.pk, 1) - 1) % lines.length];
    var on = this.state.notify;
    return {
      notifyOn: on,
      switchClass: on ? 'is-on' : '',
      notifyLine: on ? 'Notifications are on.' : 'Notifications are off.',
      diagLabel: this.state.copied ? 'Copied!' : 'Copy diagnostics',
      toggleNotify: function () { self.setState({ notify: !self.state.notify }); },
      copyDiag: function () {
        self.setState({ copied: true });
        clearTimeout(self.ct);
        self.ct = setTimeout(function () { self.setState({ copied: false }); }, 1600);
      },
      mushClass: this.state.react,
      talking: this.state.talking,
      bubbleClass: this.state.pk % 2 ? 'bubble-pop-a' : 'bubble-pop-b',
      line: line,
      liveLine: this.state.talking ? 'Morty says: ' + line : '',
      poke: function () { self.poke(); }
    };
  }
}
'''
    out += TAIL
    open(P + "Settings.dc.html", "w").write(out)


# ------------------------------------------------------------ Invalid invite
def invalid_invite():
    src = read("JoinInvite.dc.html")
    header = re.search(r"  <header.*?  </header>\n", src, re.S).group(0)
    header = header.replace("You're invited", "Code didn't work").replace(">Invite<", ">Invite code<")
    out = HEAD.format(title="Join from an invite: invalid code") + ROOT + header
    out += '  <span role="status" class="sr">{{liveLine}}</span>\n'
    out += '''
  <main style="flex: 1; min-height: 0; overflow-y: auto; padding: var(--space-8) var(--space-20) var(--space-32); display: flex; flex-direction: column; gap: var(--space-24);">
    <div class="rise" style="display: flex; flex-direction: column; gap: var(--space-6); animation-delay: 80ms;">
      <label for="invite-code" style="margin: 0 var(--space-6); font-size: var(--type-body); font-weight: var(--weight-heavy);">Invite code from Bruk</label>
      <input id="invite-code" class="field-box {{fieldClass}}" type="text" value="{{code}}" onInput="{{typeCode}}" autocomplete="off" aria-invalid="{{invalid}}" aria-describedby="code-help" style="height: var(--size-control); box-sizing: border-box; padding: 0 var(--space-18); border-radius: var(--radius-20); outline: none; font-family: var(--font-display); font-size: var(--type-heading); font-weight: var(--weight-bold); letter-spacing: var(--tracking-code); text-transform: uppercase; color: var(--color-ink);">
      <sc-if value="{{showError}}" hint-placeholder-val="{{true}}">
        <p id="code-help" role="alert" class="land" style="margin: var(--space-2) var(--space-6) 0; display: flex; align-items: flex-start; gap: var(--space-8); font-size: var(--type-small); font-weight: var(--weight-bold); color: var(--color-error);">''' + ICON(ALERT, 18) + '''That code is not a match. Check it with Bruk, or ask for a fresh link.</p>
      </sc-if>
      <sc-if value="{{showHint}}" hint-placeholder-val="{{false}}">
        <p id="code-help" style="margin: var(--space-2) var(--space-6) 0; font-size: var(--type-small); font-weight: var(--weight-medium); color: var(--color-ink-muted);">Codes look like MOREL-24.</p>
      </sc-if>
      <sc-if value="{{showOk}}" hint-placeholder-val="{{false}}">
        <p id="code-help" role="status" class="land" style="margin: var(--space-2) 0 0; display: flex; align-items: center; gap: var(--space-8); padding: var(--space-10) var(--space-12); border-radius: var(--radius-16); background: var(--color-positive-tint); font-size: var(--type-body); font-weight: var(--weight-heavy); color: var(--color-forest);">''' + ICON(CHECK, 18) + '''That works. Welcome to Our kitchen!</p>
      </sc-if>
    </div>

    <div class="rise" style="display: flex; flex-direction: column; gap: var(--space-12); animation-delay: 160ms;">
      <sc-if value="{{showCheck}}" hint-placeholder-val="{{true}}">
        <button class="btn btn-m btn-primary" onClick="{{check}}" disabled="{{empty}}">Check code</button>
      </sc-if>
      <sc-if value="{{showOk}}" hint-placeholder-val="{{false}}">
        <a class="btn btn-m btn-primary" href="Plan.dc.html">Join Our kitchen</a>
      </sc-if>
      <a class="btn btn-s btn-text" href="JoinInvite.dc.html" style="align-self: center; min-height: var(--size-target);">Back to my invite</a>
    </div>
    <p style="margin: auto 0 0; text-align: center; font-size: var(--type-small); font-weight: var(--weight-medium); color: var(--color-ink-muted);">Not expecting this? You can ignore it.</p>
  </main>
</div>
'''
    out += MID.format(w=390, h=844)
    out += '''class Component extends DCLogic {
  constructor(props) {
    super(props);
    this.state = { code: 'MOREL-42', error: true, ok: false, pk: 0, react: '', talking: false };
  }
''' + (POKE_JS.replace("@WHO@", "chanty-tap")).replace("{extra}", "") + '''  renderVals() {
    var self = this;
    var lines = [
      'Oh, darling. That code is not it.',
      'Check the letters. Check the dash!',
      'Bruk has the real one. Ask nicely.'
    ];
    var line = lines[(Math.max(this.state.pk, 1) - 1) % lines.length];
    var s = this.state;
    var empty = s.code.trim() === '';
    var liveLine = s.talking ? 'Chanty says: ' + line : '';
    return {
      code: s.code,
      empty: empty,
      invalid: s.error ? 'true' : 'false',
      fieldClass: s.error ? 'is-error' : '',
      showError: s.error,
      showOk: s.ok,
      showHint: !s.error && !s.ok,
      showCheck: !s.ok,
      typeCode: function (e) { self.setState({ code: e.target.value, error: false, ok: false }); },
      check: function () {
        var good = self.state.code.trim().toUpperCase() === 'MOREL-24';
        self.setState({ error: !good, ok: good });
      },
      mushClass: s.react,
      talking: s.talking,
      bubbleClass: s.pk % 2 ? 'bubble-pop-a' : 'bubble-pop-b',
      line: line,
      liveLine: liveLine,
      poke: function () { self.poke(); }
    };
  }
}
'''
    out += TAIL
    open(P + "JoinInviteInvalid.dc.html", "w").write(out)


# ------------------------------------------------------------ list pieces
def row(name, qty, delay, tags="", waiting=False, new=False, by=None):
    wait = ""
    if waiting:
        wait = f'''<sc-if value="{{{{waiting}}}}" hint-placeholder-val="{{{{true}}}}">
                <span style="display: flex; align-items: center; gap: var(--space-4); font-size: var(--type-micro); font-weight: var(--weight-heavy); padding: var(--space-4) var(--space-10); border-radius: var(--radius-pill); background: var(--color-tag-neutral); color: var(--color-tag-neutral-ink);">{ICON(CLOCK, 12)}Waiting to send</span>
              </sc-if>'''
    fresh = '<span class="wiggle" style="font-size: var(--type-micro); font-weight: var(--weight-heavy); padding: var(--space-4) var(--space-10); border-radius: var(--radius-pill); background: var(--color-chartreuse); color: var(--color-ink);">New</span>' if new else ""
    av = ""
    if by:
        who = {"S": "Shazya", "B": "Bruk"}[by]
        av = f'<span style="width: var(--size-avatar-s); height: var(--size-avatar-s); flex: none; border-radius: 50%; background: var(--color-surface-tint); color: var(--color-ink-on-tint); display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-size: var(--type-caption); font-weight: var(--weight-medium);"><span aria-hidden="true">{by}</span><span class="sr">Added by {who}</span></span>'
    return f'''          <button class="press rise" aria-pressed="false" style="width: 100%; min-height: var(--size-row); display: flex; align-items: center; gap: var(--space-14); padding: var(--space-10) var(--space-14); border: var(--line-w) solid var(--color-line-soft); border-radius: var(--radius-20); background: var(--color-surface-card); font: inherit; color: inherit; text-align: left; cursor: pointer; animation-delay: {delay}ms;">
            <span style="position: relative; width: var(--size-check); height: var(--size-check); flex: none;"><span aria-hidden="true" style="position: absolute; inset: 0; box-sizing: border-box; border-radius: 50%; border: var(--line-w-strong) solid var(--color-forest);"></span></span>
            <span style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: var(--space-6);">
              <span style="align-self: flex-start; font-size: var(--type-label); font-weight: var(--weight-heavy);">{name}</span>
              <span style="display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-6);">
                <span style="font-size: var(--type-small); font-weight: var(--weight-medium); color: var(--color-ink-muted);">{qty}</span>
                {tags}{wait}
              </span>
            </span>
            {fresh}{av}
          </button>
'''


def section(icon_path, bg, name, count, rows):
    return f'''      <section style="display: flex; flex-direction: column; gap: var(--space-8);">
        <h2 style="margin: 0 var(--space-4); display: flex; align-items: center; gap: var(--space-8); font-family: var(--font-display); font-size: var(--type-heading); font-weight: var(--weight-medium);">
          <span aria-hidden="true" style="width: var(--size-tile); height: var(--size-tile); border-radius: var(--radius-10); background: var(--color-{bg}); color: var(--color-forest); display: flex; align-items: center; justify-content: center;">{ICON(icon_path, 18)}</span>
          <span style="flex: 1;">{name}</span>
          <span style="min-width: var(--size-count); height: var(--size-count); padding: 0 var(--space-6); box-sizing: border-box; border-radius: var(--radius-pill); background: var(--color-surface-card); border: var(--line-w) solid var(--color-line); display: flex; align-items: center; justify-content: center; font-family: var(--font-body); font-size: var(--type-caption); font-weight: var(--weight-heavy); color: var(--color-ink-muted);">{count}</span>
        </h2>
        <div style="display: flex; flex-direction: column; gap: var(--space-6);">
{rows}        </div>
      </section>
'''


PRODUCE = '<path d="M5 19l9-11a3 3 0 0 1 4 4l-11 9z"></path><path d="M16 7l2-3M18 9l3-1M17 8l3-3"></path>'
DAIRY = '<path d="M8 3h8l2 4v14H6V7z"></path><path d="M6 7h12M10 13h4"></path>'


def tag(label, kind):
    return f'<span style="font-size: var(--type-micro); font-weight: var(--weight-heavy); padding: var(--space-4) var(--space-10); border-radius: var(--radius-pill); background: var(--color-meal-{kind}); color: var(--color-meal-{kind}-ink);">{label}</span>'


def main_header(host_html):
    mh = re.search(r"  <header.*?  </header>\n", body_of("Main.dc.html"), re.S).group(0)
    mh = HOST_RE.sub(lambda m: host_html, mh, count=1)
    return mh


def nav(active):
    n = re.search(r"  <nav.*?  </nav>\n", body_of("Main.dc.html"), re.S).group(0)
    return n


STATE_HOLES_MAIN = '''
    var remaining = %d, cart = %d;
    var pct = Math.round((cart / (remaining + cart)) * 100);
'''


# ------------------------------------------------------------------ Offline
def offline():
    host = host_of("QuickAdd.dc.html")
    out = HEAD.format(title="Offline and waiting to send") + ROOT
    out += main_header(host)
    out += '  <span role="status" class="sr">{{liveLine}}</span>\n\n'
    # sync status banner: offline, syncing, synced
    def banner(cond, bg, border, icon, text, right):
        return f'''  <sc-if value="{{{{{cond}}}}}" hint-placeholder-val="{{{{{'true' if cond == 'isOffline' else 'false'}}}}}">
    <div role="status" class="land" style="margin: 0 var(--space-20) var(--space-12); display: flex; align-items: center; gap: var(--space-10); padding: var(--space-6) var(--space-6) var(--space-6) var(--space-14); min-height: var(--size-target); border-radius: var(--radius-16); background: var(--color-{bg}); border: var(--line-w) {border}; color: var(--color-ink-soft); font-size: var(--type-small); font-weight: var(--weight-bold);">
      {icon}
      <span style="flex: 1; min-width: 0;">{text}</span>
      {right}
    </div>
  </sc-if>
'''
    out += banner("isOffline", "surface-done", "dashed var(--color-line-done)", ICON(CLOUDOFF, 18),
                  "Offline. {{waitingCount}} changes waiting to send.",
                  '<button class="btn btn-s btn-soft" onClick="{{retry}}">Try again</button>')
    out += banner("isSyncing", "surface-done", "dashed var(--color-line-done)", '<span aria-hidden="true" class="btn-spinner" style="color: var(--color-forest);"></span>',
                  "Sending {{waitingCount}} changes…",
                  '<button class="btn btn-s btn-soft is-disabled is-loading" disabled>Sending</button>')
    out += banner("isSynced", "positive-tint", "solid transparent", '<span style="color: var(--color-forest); display: flex;">' + ICON(CHECK, 18) + '</span>',
                  "Back online. Everything is sent.", "")
    out += '''
  <main style="flex: 1; min-height: 0; overflow-y: auto; padding: var(--space-4) var(--space-16) var(--size-nav-clearance); display: flex; flex-direction: column; gap: var(--space-18);">
'''
    out += section(PRODUCE, "surface-tint", "Produce", "{{produceCount}}",
                   row("Bananas", "6", 0, by="B") + row("Baby spinach", "1 bag", 45, waiting=True, by="B") + row("Limes", "4", 90, waiting=True, by="B"))
    out += section(DAIRY, "surface-tint", "Dairy &amp; eggs", "2",
                   row("Oat milk", "1 carton", 135, by="S") + row("Eggs", "1 dozen", 180, tags=tag("Pizza night", "tomato"), by="B"))
    out += '  </main>\n\n' + nav("groceries") + '</div>\n'
    out += MID.format(w=390, h=844)
    out += '''class Component extends DCLogic {
  constructor(props) {
    super(props);
    this.state = { phase: 'offline', pk: 0, react: '', talking: false };
  }
''' + (POKE_JS.replace("@WHO@", "ollie-tap")).replace("{extra}", "clearTimeout(this.st); clearTimeout(this.dt); ").replace("clearTimeout(this.rt); clearTimeout(this.tt); clearTimeout(this.st)", "clearTimeout(this.rt); clearTimeout(this.tt); clearTimeout(this.st)") + '''  renderVals() {
    var self = this;
    var phase = this.state.phase;
    var offline = phase === 'offline';
    var syncing = phase === 'syncing';
    var synced = phase === 'synced';
    var lines = offline
      ? ['No signal... I will hold on to these.', 'Your changes are safe with me.', '...hi. Still here.']
      : ['Back! I sent everything. Shyly.', 'All sent. Phew.', '...hi.'];
    var line = lines[(Math.max(this.state.pk, 1) - 1) % lines.length];
    var waiting = 2;
    var remaining = 14 + (synced ? 0 : 0);
    var cart = 3;
    var pct = Math.round((cart / (remaining + cart)) * 100);
    return {
      isOffline: offline,
      isSyncing: syncing,
      isSynced: synced,
      waiting: !synced,
      waitingCount: String(waiting),
      produceCount: '3',
      remaining: String(remaining),
      cartCount: String(cart),
      pct: pct + '%',
      pctNum: pct,
      retry: function () {
        self.setState({ phase: 'syncing' });
        clearTimeout(self.st);
        self.st = setTimeout(function () { self.setState({ phase: 'synced', pk: 0, talking: false }); }, 1400);
      },
      mushClass: this.state.react,
      talking: this.state.talking,
      bubbleClass: this.state.pk % 2 ? 'bubble-pop-a' : 'bubble-pop-b',
      line: line,
      liveLine: this.state.talking ? 'Ollie says: ' + line : '',
      poke: function () { self.poke(); }
    };
  }
}
'''
    out += TAIL
    open(P + "Offline.dc.html", "w").write(out)


# -------------------------------------------------------------------- Toast
def toast():
    host = host_of("Main.dc.html")
    host = host.replace("{{pokeCremi}}", "{{poke}}").replace("{{cremiClass}}", "{{mushClass}}").replace("{{cremiTalking}}", "{{talking}}").replace("{{cremiBubble}}", "{{bubbleClass}}").replace("{{cremiLine}}", "{{line}}")
    out = HEAD.format(title="In-app toast") + ROOT
    out += main_header(host)
    out += '  <span role="status" class="sr">{{liveLine}}</span>\n\n'
    out += '''  <div role="status" class="toast-in" style="margin: 0 var(--space-20) var(--space-12); align-self: flex-start; display: flex; align-items: center; gap: var(--space-8); padding: var(--space-6) var(--space-14) var(--space-6) var(--space-6); border-radius: var(--radius-pill); background: var(--color-ink); color: var(--color-on-brand); font-size: var(--type-small); font-weight: var(--weight-bold);">
    <span aria-hidden="true" style="width: var(--size-avatar-s); height: var(--size-avatar-s); border-radius: 50%; background: var(--color-chartreuse); color: var(--color-ink); display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-size: var(--type-caption); font-weight: var(--weight-medium);">S</span>
    <span>Shazya added Oat milk · just now</span>
  </div>

  <main style="flex: 1; min-height: 0; overflow-y: auto; padding: var(--space-4) var(--space-16) var(--size-nav-clearance); display: flex; flex-direction: column; gap: var(--space-18);">
'''
    out += section(DAIRY, "surface-tint", "Dairy &amp; eggs", "2",
                   row("Oat milk", "1 carton", 0, new=True, by="S") + row("Eggs", "1 dozen", 45, tags=tag("Pizza night", "tomato"), by="B"))
    out += section(PRODUCE, "surface-tint", "Produce", "2",
                   row("Bananas", "6", 90, by="B") + row("Baby spinach", "1 bag", 135, by="B"))
    out += '  </main>\n\n' + nav("groceries") + '</div>\n'
    out += MID.format(w=390, h=844)
    out += '''class Component extends DCLogic {
  constructor(props) {
    super(props);
    // Opens on the moment the toast lands: Cremi already has the news.
    this.state = { pk: 2, react: '', talking: true };
  }
''' + (POKE_JS.replace("@WHO@", "cremi-tap")).replace("{extra}", "") + '''  renderVals() {
    var self = this;
    var lines = [
      'Tick, tick, tick! Best part.',
      'Psst - Shazya added oat milk.',
      'Hehe, that tickles!'
    ];
    var line = lines[(Math.max(this.state.pk, 1) - 1) % lines.length];
    var remaining = 14, cart = 3;
    var pct = Math.round((cart / (remaining + cart)) * 100);
    return {
      remaining: String(remaining),
      cartCount: String(cart),
      pct: pct + '%',
      pctNum: pct,
      mushClass: this.state.react,
      talking: this.state.talking,
      bubbleClass: this.state.pk % 2 ? 'bubble-pop-a' : 'bubble-pop-b',
      line: line,
      liveLine: this.state.talking ? 'Cremi says: ' + line : '',
      poke: function () { self.poke(); }
    };
  }
}
'''
    out += TAIL
    open(P + "Toast.dc.html", "w").write(out)


if __name__ == "__main__":
    settings()
    invalid_invite()
    offline()
    toast()
