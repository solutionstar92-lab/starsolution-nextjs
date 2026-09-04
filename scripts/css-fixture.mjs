/**
 * Measures the admin CSS without needing a login.
 *
 *   node scripts/css-fixture.mjs
 *
 * The dashboard is behind auth, so the layout could not be checked in the
 * browser the way the public site can. This renders the exact markup the lead
 * detail page produces against the real stylesheets and measures it: how far
 * each element actually sits from the frame it is inside, and whether anything
 * overflows. Padding that exists in the CSS but not on screen shows up here.
 */
import { chromium } from 'playwright';
import { readFile } from 'node:fs/promises';

const css = [
  'src/app/globals.css',
  'src/app/design-system.css',
  'src/app/next-additions.css',
  'src/app/admin/admin.css',
];

const sheets = (await Promise.all(css.map((f) => readFile(f, 'utf8'))))
  // @import and tailwind directives mean nothing in a bare page
  .map((s) => s.replace(/@(tailwind|import|apply)[^;]*;/g, ''))
  .join('\n');

const html = `<!doctype html><html><head><meta charset="utf-8"><style>${sheets}</style></head>
<body>
<div class="admin-shell">
  <aside class="admin-sidebar"><div class="admin-sidebar-brand"><span class="brand-word">StarSolution</span></div></aside>
  <div class="admin-main"><div class="admin-canvas">
    <header class="admin-head"><div class="admin-head-row">
      <div><h1 id="pageTitle">martha talaat</h1><p id="pageSub">Received 3 Sept 2026, 01:13</p></div>
      <a class="btn btn-ghost btn-sm" href="#">All leads</a>
    </div></header>
    <div class="admin-body">
      <div class="admin-detail">
        <div class="admin-detail-main">
          <section class="admin-card">
            <header class="admin-card-head"><h2>Submission</h2></header>
            <dl class="admin-facts">
              <div><dt>Email</dt><dd><a id="leadEmail" href="#">mrthtlt@gmail.com</a></dd></div>
              <div><dt>Phone</dt><dd><a href="#">01276934698</a></dd></div>
              <div><dt>Business</dt><dd><span class="admin-muted">Not given</span></dd></div>
              <div><dt>Status</dt><dd><span class="admin-status is-in_progress">In progress</span></dd></div>
            </dl>
            <h3 class="admin-subhead" id="msgLabel">Message</h3>
            <p class="admin-quote" id="msgQuote">test</p>
          </section>
          <section class="admin-card">
            <header class="admin-card-head"><h2>Notes</h2><span class="admin-count">0</span></header>
            <form class="admin-note-form"><label class="admin-field-label">Add an internal note</label><textarea rows="3"></textarea><button class="btn btn-primary btn-sm">Add note</button></form>
            <p class="admin-empty-inline">No notes yet.</p>
          </section>
        </div>
        <aside class="admin-detail-side">
          <section class="admin-card" id="manageCard">
            <header class="admin-card-head"><h2>Manage</h2></header>
            <form><label class="admin-field-label">Status</label><div class="admin-select-row"><select class="admin-select"><option>In progress</option></select></div></form>
            <div class="admin-side-actions">
              <a class="btn btn-primary btn-sm w-full" href="#" id="replyBtn">Reply in Gmail</a>
              <a class="btn btn-ghost btn-sm w-full" href="#">WhatsApp</a>
              <button class="btn btn-ghost btn-sm w-full">Copy email address</button>
              <a class="admin-side-alt" href="#">Or open in your mail app</a>
            </div>
          </section>
          <section class="admin-card admin-card-danger">
            <header class="admin-card-head"><h2>Delete</h2></header>
            <p class="admin-help">Removes the lead and its notes permanently.</p>
            <button class="admin-danger-btn">Delete lead</button>
          </section>
        </aside>
      </div>
    </div>
  </div></div>
</div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage();

const failures = [];
const pass = (m) => console.log(`  PASS  ${m}`);
const fail = (m) => { console.log(`  FAIL  ${m}`); failures.push(m); };

for (const width of [390, 768, 1024, 1440]) {
  console.log(`\n== ${width}px ==`);
  await page.setViewportSize({ width, height: 1000 });
  await page.setContent(html, { waitUntil: 'load' });

  const m = await page.evaluate(() => {
    const box = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width) };
    };
    const inset = (child, parent) => {
      const c = document.querySelector(child)?.getBoundingClientRect();
      const p = document.querySelector(parent)?.getBoundingClientRect();
      if (!c || !p) return null;
      return Math.round(c.left - p.left);
    };
    const de = document.documentElement;
    return {
      viewport: de.clientWidth,
      scrollWidth: de.scrollWidth,
      emailInset: inset('#leadEmail', '.admin-detail-main .admin-card'),
      quoteInset: inset('#msgQuote', '.admin-detail-main .admin-card'),
      manage: box('#manageCard'),
      reply: box('#replyBtn'),
      titleFont: getComputedStyle(document.querySelector('#pageTitle')).fontSize,
      subFont: getComputedStyle(document.querySelector('#pageSub')).fontSize,
      subTransform: getComputedStyle(document.querySelector('#pageSub')).textTransform,
      labelFont: getComputedStyle(document.querySelector('#msgLabel')).fontSize,
      labelTransform: getComputedStyle(document.querySelector('#msgLabel')).textTransform,
    };
  });

  m.scrollWidth <= m.viewport + 1
    ? pass(`no horizontal overflow (${m.scrollWidth} <= ${m.viewport})`)
    : fail(`overflows: scrollWidth ${m.scrollWidth} > ${m.viewport}`);

  m.emailInset >= 12
    ? pass(`email sits ${m.emailInset}px inside the card`)
    : fail(`email only ${m.emailInset}px from the card edge — clipped`);

  m.quoteInset >= 12
    ? pass(`message quote sits ${m.quoteInset}px inside the card`)
    : fail(`message quote only ${m.quoteInset}px from the card edge — its accent border is on the frame`);

  m.manage && m.manage.right <= m.viewport + 1
    ? pass(`Manage panel fully on screen (right edge ${m.manage.right})`)
    : fail(`Manage panel clipped: right edge ${m.manage?.right} vs viewport ${m.viewport}`);

  // the collision: a page title must not inherit the small mono label styling
  parseFloat(m.titleFont) > 18
    ? pass(`page title ${m.titleFont}`)
    : fail(`page title is ${m.titleFont} — inheriting the label styling`);
  m.subTransform === 'none'
    ? pass(`subtitle not uppercased (${m.subFont})`)
    : fail(`subtitle text-transform is ${m.subTransform} — the label rule is still winning`);
  m.labelTransform === 'uppercase'
    ? pass(`"Message" label kept its uppercase treatment`)
    : fail(`"Message" label lost its styling (transform ${m.labelTransform})`);
}

// A picture of the widest case, for eyeballing what the numbers claim.
await page.setViewportSize({ width: 1280, height: 1000 });
await page.setContent(html, { waitUntil: 'load' });
await page.screenshot({ path: 'admin-fixture.png', fullPage: true });
console.log('screenshot: admin-fixture.png');

await browser.close();
console.log(`\n${failures.length ? `${failures.length} FAILURE(S)` : 'all measurements pass'}\n`);
process.exit(failures.length ? 1 : 0);
