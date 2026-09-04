/**
 * Drives the admin dashboard in a real browser.
 *
 *   node scripts/admin-check.mjs                      unauthenticated checks only
 *   node scripts/admin-check.mjs <email> <password>    signs in and checks the whole thing
 *
 * Written for the two complaints that are hard to reason about from the code:
 * a session that does not survive a reload, and layout that clips. Both need a
 * real browser — the first because it is about cookie storage, the second
 * because it is about measured widths.
 */
import { chromium } from 'playwright';

const BASE = process.env.BASE ?? 'http://localhost:3000';
const [email, password] = process.argv.slice(2);

const pass = (m) => console.log(`  PASS  ${m}`);
const fail = (m) => { console.log(`  FAIL  ${m}`); failures.push(m); };
const info = (m) => console.log(`        ${m}`);
const failures = [];

/** Anything wider than its container scrolls the page sideways. */
async function overflow(page) {
  return page.evaluate(() => {
    const de = document.documentElement;
    const offenders = [];
    for (const el of document.querySelectorAll('body *')) {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.right > de.clientWidth + 1) {
        offenders.push({
          tag: el.tagName.toLowerCase(),
          cls: (el.className || '').toString().slice(0, 44),
          right: Math.round(r.right),
        });
      }
    }
    return {
      docWidth: de.clientWidth,
      scrollWidth: de.scrollWidth,
      // the widest few, de-duplicated by class
      offenders: [...new Map(offenders.map((o) => [o.cls, o])).values()].slice(0, 6),
    };
  });
}

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

const consoleErrors = [];
page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
page.on('pageerror', (e) => consoleErrors.push(`pageerror: ${e.message}`));

console.log(`\n== unauthenticated ==`);
{
  const res = await page.goto(`${BASE}/admin/systems`, { waitUntil: 'networkidle' });
  const url = page.url();
  url.includes('/admin/login?next=')
    ? pass(`/admin/systems redirects to login (${res.status()})`)
    : fail(`/admin/systems did not redirect, landed on ${url}`);
}
{
  await page.goto(`${BASE}/admin/login`, { waitUntil: 'networkidle' });
  const hasForm = await page.locator('form input[name="email"]').count();
  hasForm ? pass('login form renders') : fail('login form missing');
}

console.log(`\n== layout at each breakpoint (login) ==`);
for (const width of [360, 414, 768, 1024, 1440]) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto(`${BASE}/admin/login`, { waitUntil: 'networkidle' });
  const o = await overflow(page);
  o.scrollWidth <= o.docWidth + 1
    ? pass(`${width}px no horizontal overflow`)
    : fail(`${width}px overflows: scrollWidth ${o.scrollWidth} > ${o.docWidth}`);
  if (o.offenders.length) o.offenders.forEach((x) => info(`${x.tag}.${x.cls} right=${x.right}`));
}

if (email && password) {
  console.log(`\n== signed in ==`);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE}/admin/login`, { waitUntil: 'networkidle' });
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);

  const t0 = Date.now();
  await Promise.all([
    page.waitForURL((u) => !u.pathname.startsWith('/admin/login'), { timeout: 30000 }).catch(() => {}),
    page.click('button[type="submit"]'),
  ]);
  const signInMs = Date.now() - t0;

  page.url().includes('/admin/login')
    ? fail(`sign-in stayed on the login page: ${await page.locator('.admin-alert').first().textContent().catch(() => 'no message')}`)
    : pass(`signed in, landed on ${new URL(page.url()).pathname} (${signInMs}ms)`);

  if (!page.url().includes('/admin/login')) {
    const jar = (await ctx.cookies()).filter((c) => c.name.startsWith('sb-'));
    info(`auth cookies: ${jar.length} -> ${jar.map((c) => `${c.name}(${c.value.length}b sameSite=${c.sameSite} secure=${c.secure})`).join(', ')}`);
    jar.length ? pass('auth cookies stored by the browser') : fail('no sb- cookies were stored');

    // THE reported bug: does the session survive a hard reload?
    for (let i = 1; i <= 3; i++) {
      const t = Date.now();
      await page.reload({ waitUntil: 'networkidle' });
      const ms = Date.now() - t;
      page.url().includes('/admin/login')
        ? fail(`reload #${i} lost the session (bounced to login) after ${ms}ms`)
        : pass(`reload #${i} kept the session (${ms}ms)`);
      if (page.url().includes('/admin/login')) break;
    }

    // navigation timing around the sidebar
    console.log(`\n== navigation ==`);
    for (const path of ['/admin/leads', '/admin/systems', '/admin/automations', '/admin/team', '/admin']) {
      const t = Date.now();
      await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' });
      const ms = Date.now() - t;
      const bounced = page.url().includes('/admin/login');
      bounced ? fail(`${path} bounced to login`) : pass(`${path} ${ms}ms`);
      if (bounced) break;
    }

    console.log(`\n== dashboard layout at each breakpoint ==`);
    for (const width of [360, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`${BASE}/admin/systems`, { waitUntil: 'networkidle' });
      const o = await overflow(page);
      o.scrollWidth <= o.docWidth + 1
        ? pass(`${width}px no horizontal overflow`)
        : fail(`${width}px overflows: scrollWidth ${o.scrollWidth} > ${o.docWidth}`);
      o.offenders.forEach((x) => info(`${x.tag}.${x.cls} right=${x.right}`));
    }

    // the edit form is the widest, most field-dense page
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE}/admin/systems`, { waitUntil: 'networkidle' });
    const firstEdit = page.locator('a:has-text("Edit")').first();
    if (await firstEdit.count()) {
      await firstEdit.click();
      await page.waitForLoadState('networkidle');
      const o = await overflow(page);
      o.scrollWidth <= o.docWidth + 1
        ? pass('edit form no horizontal overflow')
        : fail(`edit form overflows: ${o.scrollWidth} > ${o.docWidth}`);
      o.offenders.forEach((x) => info(`${x.tag}.${x.cls} right=${x.right}`));
      await page.screenshot({ path: 'admin-edit.png', fullPage: true });
      info('screenshot: admin-edit.png');
    }
  }
}

console.log(`\n== console errors ==`);
consoleErrors.length
  ? consoleErrors.slice(0, 10).forEach((e) => fail(`console: ${e.slice(0, 160)}`))
  : pass('none');

await browser.close();
console.log(`\n${failures.length ? `${failures.length} FAILURE(S)` : 'all checks passed'}\n`);
process.exit(failures.length ? 1 : 0);
