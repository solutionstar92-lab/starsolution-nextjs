/**
 * Full-page screenshots of the live client stores.
 *
 * The project cards show the finished site in a scrollable frame. A live
 * <iframe> is not an option — both storefronts send `x-frame-options: DENY`
 * and `frame-ancestors 'none'`, which the browser enforces from their side.
 * So we capture the pages instead and scroll the image.
 *
 *   npm run shots            capture every project in site.json
 *   npm run shots -- montre  capture only slugs matching "montre"
 *
 * Re-run after a store redesign; the output is committed to public/shots.
 */
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'public', 'shots');

/** Wide enough to render the desktop layout, narrow enough to stay legible
 *  once it is scaled down into the card. */
const VIEWPORT = { width: 1200, height: 900 };
const SCALE = 2;

/** Storefronts lazy-load below the fold, so walk the page before shooting. */
async function scrollThrough(page) {
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.75;
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 450));
    }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 600));
  });
  // give whatever the walk kicked off a chance to finish decoding
  await page
    .waitForFunction(
      () => [...document.images].every((i) => i.complete),
      null,
      { timeout: 20_000 },
    )
    .catch(() => {});
}

/**
 * Anything pinned to the viewport — cookie bars, chat bubbles, back-to-top —
 * is painted once over the whole length of a full-page capture. Drop them.
 * Headers get un-pinned rather than removed so the page still reads correctly.
 */
async function dismissOverlays(page) {
  await page.evaluate(() => {
    const isHeader = (el) =>
      el.tagName === 'HEADER' || /header|nav|announcement|topbar/i.test(el.className || '');

    for (const el of document.querySelectorAll('body *')) {
      const s = getComputedStyle(el);
      if (s.position !== 'fixed' && s.position !== 'sticky') continue;
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) continue;
      if (isHeader(el)) { el.style.position = 'relative'; continue; }
      el.remove();
    }
  });
}

/**
 * Shopify themes often report a scrollHeight far past the last painted pixel
 * (reserved space for sections that never hydrate). Measure where content
 * actually ends so the capture is not mostly blank.
 */
/**
 * Trim a blank tail off a capture, measured from the pixels rather than the DOM.
 *
 * Some themes reserve thousands of pixels for sections that never paint, and no
 * DOM heuristic catches that reliably — the reserved block has a real height and
 * a real background colour. So: downscale the shot, scan rows from the bottom,
 * and cut where the image stops being a flat band of the trailing colour.
 * Runs on a blank page in the same browser, so it costs no extra dependency.
 */
async function trimBlankTail(browser, buffer) {
  const page = await browser.newPage();
  try {
    const out = await page.evaluate(async (b64) => {
      const res = await fetch(`data:image/jpeg;base64,${b64}`);
      const bmp = await createImageBitmap(await res.blob());

      // scan a cheap downscaled copy
      const sw = 160;
      const sh = Math.max(1, Math.round((bmp.height / bmp.width) * sw));
      const small = new OffscreenCanvas(sw, sh);
      const sctx = small.getContext('2d', { willReadFrequently: true });
      sctx.drawImage(bmp, 0, 0, sw, sh);
      const px = sctx.getImageData(0, 0, sw, sh).data;

      const at = (x, y) => {
        const i = (y * sw + x) * 4;
        return [px[i], px[i + 1], px[i + 2]];
      };
      const rowFlat = (y, ref) => {
        for (let x = 0; x < sw; x++) {
          const [r, g, bl] = at(x, y);
          if (Math.abs(r - ref[0]) > 6 || Math.abs(g - ref[1]) > 6 || Math.abs(bl - ref[2]) > 6) return false;
        }
        return true;
      };

      const ref = at(Math.floor(sw / 2), sh - 1);
      let lastContent = sh - 1;
      while (lastContent > 0 && rowFlat(lastContent, ref)) lastContent--;

      const keep = Math.min(bmp.height, Math.round(((lastContent + 2) / sh) * bmp.height) + 24);
      if (keep >= bmp.height - 8) return null; // nothing worth trimming

      const full = new OffscreenCanvas(bmp.width, keep);
      full.getContext('2d').drawImage(bmp, 0, 0);
      const blob = await full.convertToBlob({ type: 'image/jpeg', quality: 0.82 });
      const buf = new Uint8Array(await blob.arrayBuffer());
      let s = '';
      for (const byte of buf) s += String.fromCharCode(byte);
      return { b64: btoa(s), height: keep, was: bmp.height };
    }, buffer.toString('base64'));

    return out;
  } finally {
    await page.close();
  }
}

async function contentBottom(page) {
  return page.evaluate(() => {
    window.scrollTo(0, 0);

    // Only count elements that actually paint something. An empty <div> with a
    // reserved height is exactly what creates the phantom tail, so measuring
    // "any element" would keep it.
    // Media and text only. Background colour is deliberately NOT a signal: the
    // phantom tail is usually a full-width section painted the page colour, so
    // counting backgrounds keeps exactly what we are trying to cut.
    const paints = (el) => {
      // an <img> that never decoded occupies layout but renders nothing, which
      // is what leaves a blank tail on a lazy-loading storefront
      if (el.tagName === 'IMG') return el.complete && el.naturalWidth > 0;
      if (el.matches('picture, video, canvas, svg, iframe')) return true;
      if (getComputedStyle(el).backgroundImage !== 'none') return true;
      for (const n of el.childNodes) {
        if (n.nodeType === 3 && n.textContent.trim()) return true;
      }
      return false;
    };

    let max = 0;
    for (const el of document.querySelectorAll('body *')) {
      const s = getComputedStyle(el);
      if (s.position === 'fixed' || s.position === 'sticky') continue;
      if (s.display === 'none' || s.visibility === 'hidden' || s.opacity === '0') continue;
      const r = el.getBoundingClientRect();
      if (r.width < 4 || r.height < 4) continue;
      if (!paints(el)) continue;
      max = Math.max(max, r.bottom);
    }
    return Math.ceil(max) + 32; // a little breathing room under the last row
  });
}

const filter = process.argv.slice(2).filter((a) => !a.startsWith('-'));

const site = JSON.parse(await readFile(path.join(root, 'src', 'data', 'site.json'), 'utf8'));
const targets = site.projects
  .filter((p) => p.url)
  .filter((p) => !filter.length || filter.some((f) => p.slug.includes(f)));

if (!targets.length) {
  console.error('No projects matched.', filter.length ? `Filter: ${filter.join(', ')}` : '');
  process.exit(1);
}

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const results = [];

for (const project of targets) {
  const page = await browser.newPage({
    viewport: VIEWPORT,
    deviceScaleFactor: SCALE,
    // a real UA: some themes serve a stripped page to headless clients
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  });

  try {
    process.stdout.write(`  ${project.slug} … `);
    // Chat widgets and analytics keep polling, so networkidle can never fire.
    // Try for a quiet network, then settle for the load event.
    try {
      await page.goto(project.url, { waitUntil: 'networkidle', timeout: 45_000 });
    } catch {
      await page.goto(project.url, { waitUntil: 'load', timeout: 90_000 });
      await page.waitForTimeout(3_000);
    }
    await dismissOverlays(page);
    await scrollThrough(page);
    await dismissOverlays(page);
    await page.waitForTimeout(600);

    const scrollH = await page.evaluate(() => document.documentElement.scrollHeight);
    const domHeight = Math.min(await contentBottom(page), scrollH);

    let buf = await page.screenshot({
      type: 'jpeg',
      quality: 82,
      // fullPage is required for a clip that reaches past the viewport
      fullPage: true,
      clip: { x: 0, y: 0, width: VIEWPORT.width, height: domHeight },
    });

    // second pass: cut anything the DOM measurement still left blank
    let height = domHeight;
    const trimmedShot = await trimBlankTail(browser, buf);
    if (trimmedShot) {
      buf = Buffer.from(trimmedShot.b64, 'base64');
      height = Math.round(trimmedShot.height / SCALE);
    }

    await writeFile(path.join(outDir, `${project.slug}.jpg`), buf);
    results.push({ slug: project.slug, width: VIEWPORT.width, height, kb: Math.round(buf.length / 1024) });

    const cut = scrollH - height;
    console.log(
      `${VIEWPORT.width}×${height}  ${Math.round(buf.length / 1024)} KB` +
      (cut > 50 ? `  (cut ${cut}px of blank tail)` : ''),
    );
  } catch (err) {
    console.log(`FAILED — ${err.message.split('\n')[0]}`);
  } finally {
    await page.close();
  }
}

await browser.close();

// The component imports this to know which projects have a capture and how
// tall it is. Lives in src/data so it is a normal module import.
await writeFile(
  path.join(root, 'src', 'data', 'shots.json'),
  JSON.stringify(Object.fromEntries(results.map((r) => [r.slug, { width: r.width, height: r.height }])), null, 2) + '\n',
);

console.log(`\n${results.length}/${targets.length} captured → public/shots`);
if (results.length < targets.length) process.exitCode = 1;
