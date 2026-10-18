const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');
const PROJECT = require('path').resolve(__dirname, '..') + '/';
const OUT = process.env.OUT || require('path').resolve(__dirname, '..', '.shots') + '/';
fs.mkdirSync(OUT, { recursive: true });
const files = process.argv.slice(2);
(async () => {
  const b = await chromium.launch();
  for (const f of files) {
    const src = fs.readFileSync(PROJECT + f, 'utf8');
    const js = /<script type="text\/x-dc"[^>]*>([\s\S]*?)<\/script>/.exec(src)[1];
    const page = await b.newPage({ viewport: { width: 1300, height: 900 } });
    const errs = [];
    page.on('pageerror', e => errs.push('pageerror: ' + e.message));
    page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
    await page.goto('file://' + PROJECT + f, { waitUntil: 'load' });
    await page.evaluate((js) => {
      class DCLogic { constructor(props){ this.props = props || {}; this.state = {}; } setState(p){ this.state = Object.assign({}, this.state, typeof p === 'function' ? p(this.state) : p); } }
      const C = new Function('DCLogic', js + '\nreturn Component;')(DCLogic);
      const inst = new C({});
      const vals = inst.renderVals();
      const get = (path, scope) => { const parts = path.trim().split('.'); let v = scope[parts[0]]; if (parts[0]==='true') return true; if (parts[0]==='false') return false; if (parts[0]==='null') return null; for (let i = 1; i < parts.length && v != null; i++) v = v[parts[i]]; return v; };
      const interp = (s, scope) => { const m = /^\{\{(.*)\}\}$/.exec(s.trim()); if (m && !/\}\}/.test(m[1])) return get(m[1], scope); return s.replace(/\{\{(.*?)\}\}/g, (_, p) => { const v = get(p, scope); return v == null ? '' : String(v); }); };
      const expand = (node, scope) => {
        if (node.nodeType === 3) return [document.createTextNode(node.textContent.includes('{{') ? String(interp(node.textContent, scope) ?? '') : node.textContent)];
        if (node.nodeType !== 1) return [];
        const tag = node.tagName;
        if (tag === 'SC-IF') { const v = interp(node.getAttribute('value'), scope); return v ? [...node.childNodes].flatMap(c => expand(c, scope)) : []; }
        if (tag === 'SC-FOR') { const list = interp(node.getAttribute('list'), scope) || []; const as = node.getAttribute('as'); return list.flatMap((item, i) => [...node.childNodes].flatMap(c => expand(c, Object.assign({}, scope, { [as]: item, $index: i })))); }
        const el = node.cloneNode(false);
        for (const a of [...node.attributes]) {
          if (a.value.includes('{{')) {
            const v = interp(a.value, scope);
            if (typeof v === 'function' || v === false || v == null) el.removeAttribute(a.name);
            else if (v === true) el.setAttribute(a.name, '');
            else el.setAttribute(a.name, String(v));
          }
        }
        for (const c of node.childNodes) for (const n of expand(c, scope)) el.appendChild(n);
        return [el];
      };
      const xdc = document.querySelector('x-dc');
      const kids = [...xdc.childNodes].filter(n => !(n.nodeType === 1 && n.tagName === 'HELMET'));
      const out = kids.flatMap(c => expand(c, vals));
      for (const k of kids) k.remove();
      for (const n of out) xdc.appendChild(n);
      window.__root = [...xdc.children].find(e => e.tagName !== 'HELMET');
    }, js);
    await page.waitForTimeout(700);
    const box = await page.evaluate(() => { const r = window.__root.getBoundingClientRect(); return { w: r.width, h: r.height, sh: window.__root.scrollHeight, sw: window.__root.scrollWidth }; });
    const name = f.replace('.dc.html', '');
    await page.screenshot({ path: OUT + name + '.png', clip: { x: 0, y: 0, width: Math.ceil(box.w), height: Math.ceil(Math.max(box.h, box.sh)) }, fullPage: true });
    console.log(f, JSON.stringify(box), errs.join(' | '));
    await page.close();
  }
  await b.close();
})();
