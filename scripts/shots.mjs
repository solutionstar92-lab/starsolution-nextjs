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
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'public', 'shots');

/** Wide enough to render the desktop layout, narrow enough to stay legible
 *  once it is scaled down into the card. */
const VIEWPORT = { width: 1200, height: 900 };
/**
 * 1, not 2. These pages are 3000-9000px tall, so a 2x capture lands at 30-40
 * megapixels — the browser needs seconds to rasterise one, and the comparison
 * frame sits there blank until it does. At 1x a capture is still ~1200px wide
 * against a frame that is 420px at its widest, so there is nothing to gain
 * from the extra sampling.
 */
const SCALE = 1;

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

/**
 * Re-encode to WebP and derive a tiny blurred stand-in.
 *
 * The frame is blank white until a ~1MB JPEG arrives, and that gap is the
 * "lag" you notice on the after side — decoding is only ~100ms, the wait is
 * the download. WebP takes 30-45% off the wire, and the stand-in is a 24px-wide
 * copy inlined into the manifest as a data URI, so the frame paints the shape
 * of the page immediately and the real capture replaces it when it lands.
 */
async function encodeAssets(browser, buffer) {
  const page = await browser.newPage();
  try {
    return await page.evaluate(async (b64) => {
      const res = await fetch(`data:image/jpeg;base64,${b64}`);
      const bmp = await createImageBitmap(await res.blob());
      const toB64 = async (blob) => {
        const buf = new Uint8Array(await blob.arrayBuffer());
        let s = '';
        for (const byte of buf) s += String.fromCharCode(byte);
        return btoa(s);
      };

      const full = new OffscreenCanvas(bmp.width, bmp.height);
      full.getContext('2d').drawImage(bmp, 0, 0);
      const webp = await toB64(await full.convertToBlob({ type: 'image/webp', quality: 0.8 }));

      // Only the first screenful is ever visible before you scroll, so the
      // stand-in covers that rather than the whole 9000px page — squeezing the
      // full height into 24px wide would smear it into flat bands.
      const lw = 24;
      const lh = Math.max(1, Math.round((Math.min(bmp.height, bmp.width * 0.75) / bmp.width) * lw));
      const tiny = new OffscreenCanvas(lw, lh);
      tiny.getContext('2d').drawImage(bmp, 0, 0, bmp.width, Math.min(bmp.height, bmp.width * 0.75), 0, 0, lw, lh);
      const lqip = await toB64(await tiny.convertToBlob({ type: 'image/webp', quality: 0.6 }));

      return { webp, lqip: `data:image/webp;base64,${lqip}` };
    }, buffer.toString('base64'));
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

// A project with `beforeUrl` gets a second capture, keyed `<slug>-before`. The
// comparison then shows the real site we replaced rather than the generic
// dated-web mock — worth it whenever the old one is still online.
const targets = site.projects
  .filter((p) => p.url)
  .filter((p) => !filter.length || filter.some((f) => p.slug.includes(f)))
  .flatMap((p) => [
    { slug: p.slug, url: p.url },
    ...(p.beforeUrl ? [{ slug: `${p.slug}-before`, url: p.beforeUrl }] : []),
  ]);

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

    const { webp, lqip } = await encodeAssets(browser, buf);
    const out = Buffer.from(webp, 'base64');
    await writeFile(path.join(outDir, `${project.slug}.webp`), out);
    // an earlier run of this script wrote JPEGs; drop the stale twin
    await rm(path.join(outDir, `${project.slug}.jpg`), { force: true });
    results.push({ slug: project.slug, width: VIEWPORT.width, height, lqip });

    const cut = scrollH - height;
    console.log(
      `${VIEWPORT.width}×${height}  ${Math.round(out.length / 1024)} KB` +
      ` (jpeg was ${Math.round(buf.length / 1024)} KB)` +
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
//
// Merged, not replaced: a filtered run (`npm run shots -- montre`) only holds
// results for what it captured, and writing just those drops every other
// project out of the manifest — the jpgs stay on disk but the component stops
// believing in them. Entries whose jpg is gone are pruned.
const manifestPath = path.join(root, 'src', 'data', 'shots.json');
let manifest = {};
try {
  manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
} catch {
  // first run, or the file was removed by hand — start clean
}
for (const r of results) manifest[r.slug] = { width: r.width, height: r.height, lqip: r.lqip };
for (const slug of Object.keys(manifest)) {
  if (!existsSync(path.join(outDir, `${slug}.webp`))) delete manifest[slug];
}
await writeFile(
  manifestPath,
  JSON.stringify(
    Object.fromEntries(Object.keys(manifest).sort().map((k) => [k, manifest[k]])),
    null,
    2,
  ) + '\n',
);

console.log(`\n${results.length}/${targets.length} captured → public/shots`);
if (results.length < targets.length) process.exitCode = 1;
