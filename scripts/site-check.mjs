/**
 * Drives the public site in a real browser.
 *
 *   node scripts/site-check.mjs
 *
 * Written after the public pages moved into the (site) route group. Status
 * codes said the move was fine; this checks the things a 200 does not — that
 * the header and footer actually render, that the content each page is
 * supposed to show is present, that nothing overflows sideways, and that no
 * page throws in the browser.
 */
import { chromium } from 'playwright';

const BASE = process.env.BASE ?? 'http://localhost:3000';

const failures = [];
const pass = (m) => console.log(`  PASS  ${m}`);
const fail = (m) => { console.log(`  FAIL  ${m}`); failures.push(m); };
const info = (m) => console.log(`        ${m}`);

/** Pages, and a string each must contain if it rendered its own content. */
const PAGES = [
  ['/', 'Read about this project'],
  ['/about', null],
  ['/solutions', null],
  ['/goals', null],
  ['/systems', 'Accounting System'],
  ['/automations', 'Smart Multi-Number WhatsApp Inbox'],
  ['/case-studies', null],
  ['/results', null],
  ['/process', null],
  ['/team', null],
  ['/work', 'Dispatch, COD settlement and proof of delivery'],
  ['/blog', null],
  ['/contact', null],
  ['/systems/courier-system', 'shipment lifecycle from pickup request'],
  ['/systems/google-analytics-system', 'Know exactly where every customer came from'],
  ['/automations/ecommerce-chatbot', 'all-in-one, AI-powered platform'],
  ['/automations/custom-automations', 'Cash on delivery is where the losses are'],
  ['/work/hollywood-clinics', null],
  ['/team/heba-hesham', null],
  ['/zzz-missing', 'That page is off the map'],
];

async function overflow(page) {
  return page.evaluate(() => {
    const de = document.documentElement;
    const out = [];
    for (const el of document.querySelectorAll('body *')) {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.right > de.clientWidth + 1) {
        out.push({ tag: el.tagName.toLowerCase(), cls: String(el.className || '').slice(0, 40), right: Math.round(r.right) });
      }
    }
    return {
      docWidth: de.clientWidth,
      scrollWidth: de.scrollWidth,
      offenders: [...new Map(out.map((o) => [o.cls, o])).values()].slice(0, 5),
    };
  });
}

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

const errors = [];
page.on('console', (m) => {
  if (m.type() !== 'error') return;
  const text = m.text();
  // The 404 route is meant to 404; the browser logging that is not a defect.
  if (text.includes('status of 404')) return;
  errors.push(`${page.url()} :: ${text}`);
});
page.on('pageerror', (e) => errors.push(`${page.url()} :: ${e.message}`));

console.log('\n== chrome and content ==');
for (const [path, needle] of PAGES) {
  const res = await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' });
  const status = res?.status();
  const html = await page.content();

  const hasHeader = (await page.locator('header .brand-word, .promo-bar').count()) > 0;
  const hasFooter = (await page.locator('footer').count()) > 0;
  const ok404 = path === '/zzz-missing' ? status === 404 : status === 200;

  const problems = [];
  if (!ok404) problems.push(`status ${status}`);
  if (!hasHeader) problems.push('no header');
  if (!hasFooter) problems.push('no footer');
  if (needle && !html.includes(needle)) problems.push(`missing content: "${needle.slice(0, 40)}"`);

  problems.length ? fail(`${path} — ${problems.join(', ')}`) : pass(path);
}

console.log('\n== admin must not carry the public chrome ==');
{
  await page.goto(`${BASE}/admin/login`, { waitUntil: 'networkidle' });
  const bad = [];
  if (await page.locator('header .brand-word, .promo-bar').count()) bad.push('public header present');
  if (await page.locator('footer').count()) bad.push('public footer present');
  bad.length ? fail(`/admin/login — ${bad.join(', ')}`) : pass('/admin/login has no public chrome');
}

console.log('\n== horizontal overflow, key pages ==');
for (const width of [360, 414, 768, 1024, 1440]) {
  await page.setViewportSize({ width, height: 900 });
  for (const path of ['/', '/work', '/systems/courier-system', '/contact']) {
    await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' });
    const o = await overflow(page);
    if (o.scrollWidth > o.docWidth + 1) {
      fail(`${width}px ${path} overflows (${o.scrollWidth} > ${o.docWidth})`);
      o.offenders.forEach((x) => info(`${x.tag}.${x.cls} right=${x.right}`));
    }
  }
  pass(`${width}px checked`);
}

console.log('\n== expandable project card still works ==');
{
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
  const toggle = page.locator('button.live-toggle').first();
  if (!(await toggle.count())) {
    fail('no project card toggle found');
  } else {
    await toggle.click();
    await page.waitForTimeout(600);
    const open = await page.locator('.live-more').count();
    open ? pass('card expands in place') : fail('card did not expand');
    const text = await page.locator('.live-summary').first().textContent().catch(() => '');
    text && text.length > 40 ? pass('expanded card shows the summary') : fail('expanded card has no summary');
  }
}

console.log('\n== console errors ==');
errors.length ? errors.slice(0, 8).forEach((e) => fail(e.slice(0, 170))) : pass('none');

await browser.close();
console.log(`\n${failures.length ? `${failures.length} FAILURE(S)` : 'all checks passed'}\n`);
process.exit(failures.length ? 1 : 0);
