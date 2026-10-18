"""Mechanical checks for the Grocs canvas files.

Usage: python3 design/canvas/tools/dc_check.py [canvas_dir]
Exits 1 when any ERROR is found. WARN lines are advisory.

Why each rule exists:
- support.js head line, x-dc block and DCLogic script: the canvas runtime renders nothing without them.
- Balanced tags: the runtime fails silently on an unclosed element.
- Holes must be dotted lookups: expressions inside {{ }} render as nothing, with no error.
- data-props must parse and declare $preview: the canvas sizes the artboard from it.
- dc-import targets must exist: a missing child renders as an empty box.
- canvas.json must list every artboard with matching size: unlisted files still show, mis-sized.
- Raw hex outside grocs.css: token drift, which is what the reviews flagged.
"""

import html
import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"}
HOLE_OK = re.compile(r"^\s*(\$?[A-Za-z_][\w$]*(\.[\w$]+)*|true|false|null|-?\d+(\.\d+)?|'[^']*'|\"[^\"]*\")\s*$")


class Balance(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = []
        self.errors = []

    def handle_starttag(self, tag, attrs):
        if tag not in VOID:
            self.stack.append((tag, self.getpos()[0]))

    def handle_startendtag(self, tag, attrs):
        pass

    def handle_endtag(self, tag):
        if tag in VOID:
            return
        if not self.stack:
            self.errors.append(f"line {self.getpos()[0]}: stray </{tag}>")
            return
        top, line = self.stack[-1]
        if top == tag:
            self.stack.pop()
            return
        names = [t for t, _ in self.stack]
        if tag in names:
            while self.stack and self.stack[-1][0] != tag:
                t, ln = self.stack.pop()
                self.errors.append(f"line {ln}: <{t}> never closed (closed by </{tag}> at line {self.getpos()[0]})")
            self.stack.pop()
        else:
            self.errors.append(f"line {self.getpos()[0]}: </{tag}> has no opening tag")


def check_file(path: Path, tokens_hex: set[str]):
    errors, warns = [], []
    src = path.read_text(encoding="utf-8")
    if '<script src="./support.js"></script>' not in src:
        errors.append("missing exact head line <script src=\"./support.js\"></script>")
    m = re.search(r"<x-dc>(.*)</x-dc>", src, re.S)
    if not m:
        errors.append("missing <x-dc>...</x-dc> block")
        body = ""
    else:
        body = m.group(1)
    if "class Component extends DCLogic" not in src:
        errors.append("missing `class Component extends DCLogic` script")
    p = Balance()
    p.feed(re.sub(r"<script\b.*?</script>", "", body, flags=re.S))
    p.close()
    errors += p.errors
    for t, ln in p.stack:
        errors.append(f"x-dc line {ln}: <{t}> never closed")
    for hole in re.findall(r"\{\{(.*?)\}\}", body):
        if not HOLE_OK.match(hole):
            errors.append(f"hole is not a dotted lookup: {{{{{hole.strip()}}}}}")
    preview = None
    dm = re.search(r"data-props='([^']*)'", src)
    if not dm:
        errors.append("missing single-quoted data-props on the dc script")
    else:
        try:
            props = json.loads(html.unescape(dm.group(1)))
            preview = props.get("$preview")
            if not preview or "width" not in preview or "height" not in preview:
                errors.append("data-props has no $preview {width, height}")
        except json.JSONDecodeError as e:
            errors.append(f"data-props is not valid JSON: {e}")
    for name in re.findall(r'<dc-import\s+name="([^"]+)"', body):
        if not (path.parent / f"{name}.dc.html").exists():
            errors.append(f'<dc-import name="{name}"> has no {name}.dc.html beside it')
    if re.search(r"<dc-import[^>]*/>", body):
        errors.append("<dc-import> must not self-close")
    if tokens_hex:
        markup = re.sub(r"<svg\b.*?</svg>", "", body, flags=re.S | re.I)
        stray = {h.upper() for h in re.findall(r"#[0-9A-Fa-f]{6}\b", markup)} - tokens_hex
        if stray:
            warns.append(f"{len(stray)} hex colours outside grocs.css tokens (non-SVG markup): {', '.join(sorted(stray)[:12])}")
    return errors, warns, preview


def main():
    root = Path(sys.argv[1] if len(sys.argv) > 1 else Path(__file__).resolve().parent.parent)
    tokens_hex = set()
    css = root / "grocs.css"
    if css.exists():
        tokens_hex = {h.upper() for h in re.findall(r"#[0-9A-Fa-f]{6}\b", css.read_text())}
    canvas = json.loads((root / "canvas.json").read_text())
    boards = canvas.get("boards", {})
    order = canvas.get("order", [])
    total_err = 0
    files = sorted(p for p in root.glob("*.dc.html"))
    for f in files:
        errs, warns, preview = check_file(f, tokens_hex)
        if f.name not in boards:
            errs.append("not listed in canvas.json boards")
        elif preview:
            b = boards[f.name]
            if (b.get("w"), b.get("h")) != (preview["width"], preview["height"]):
                errs.append(f"canvas.json size {b.get('w')}x{b.get('h')} != $preview {preview['width']}x{preview['height']}")
        if f.name not in order:
            errs.append("not listed in canvas.json order")
        for e in errs:
            print(f"ERROR {f.name}: {e}")
        for w in warns:
            print(f"WARN  {f.name}: {w}")
        total_err += len(errs)
    for name in boards:
        if not (root / name).exists():
            print(f"ERROR canvas.json: board {name} has no file")
            total_err += 1
    print(f"\n{len(files)} files checked, {total_err} errors")
    sys.exit(1 if total_err else 0)


if __name__ == "__main__":
    main()
