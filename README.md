# StarSolution.ai — Next.js + Supabase

The approved HTML design, rebuilt as a Next.js 14 app with the App Router,
TypeScript, Tailwind, Framer Motion and Supabase.

**The design is unchanged.** The original stylesheet was lifted out of the HTML
and dropped in as `src/app/design-system.css` exactly as it was. Everything new
(pages that did not exist before, route transitions) lives in
`src/app/next-additions.css` so the two never get confused.

---

## Run it

```bash
npm install
npm run dev          # http://localhost:3000
```

That is all you need — the site runs immediately on the bundled seed data, with
no database and no environment variables.

### In VS Code

1. **File → Open Folder…** and pick this folder.
2. Open the terminal (`Ctrl + \``) and run the two commands above.
3. `Ctrl/Cmd + click` the `http://localhost:3000` link in the terminal.

Recommended extensions: **ESLint**, **Tailwind CSS IntelliSense**, **Prettier**.

### Build for production

```bash
npm run build
npm start
```

---

## Connecting Supabase

The site works without it. Connect a project when you want to edit content
without touching code.

1. Create a project at [supabase.com](https://supabase.com).
2. **SQL Editor → New query** → paste `supabase/schema.sql` → Run.
3. Same again with `supabase/seed.sql` to load the current content.
4. Copy `.env.example` to `.env.local` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhb...
SUPABASE_SERVICE_ROLE_KEY=eyJhb...
```

5. Restart `npm run dev`.

**How the fallback works.** `src/lib/content.ts` queries the matching table and
returns the seed data whenever Supabase is absent, errors, or the table is
empty. So a bad key or a typo degrades to a working site rather than a blank
page. The contact page shows which mode is live.

Row level security is on for every table: content is public read-only, and
`leads` has no public policy at all — only the server route can write to it,
using the service role key.

---

## Routes

Every card, tile, chip and avatar on the home page links to a real page.

| Route | What it is |
| --- | --- |
| `/` | Home |
| `/solutions`, `/solutions/[slug]` | 6 services |
| `/goals`, `/goals/[slug]` | 4 business goals |
| `/case-studies`, `/case-studies/[slug]` | 5 case studies |
| `/systems`, `/systems/[slug]` | 5 custom systems |
| `/automations`, `/automations/[slug]` | 6 automations |
| `/team`, `/team/[slug]` | 7 people |
| `/work`, `/work/[slug]` | Live site projects with the before/after slider |
| `/results` | Interactive KPI chart, cases and reviews |
| `/process` · `/about` · `/contact` · `/blog` · `/blog/[slug]` | Standalone pages |
| `/api/leads` | POST endpoint for the audit form |

Detail pages are statically generated at build time from the slug list.

---

## Editing content

| What | Where |
| --- | --- |
| Everything on the site | `src/data/site.json` (or the Supabase tables) |
| Blog posts | `src/data/posts.json` |
| KPI chart data | `charts` in `src/data/site.json` |
| Walkthrough videos | the `video` field on any entry |

**Videos.** Every entry has a `video` field. Leave it `{}` for the "coming soon"
placeholder, or point it at a file or a YouTube id:

```json
"video": { "src": "/videos/courier.mp4", "poster": "/videos/courier.jpg" }
"video": { "youtube": "VIDEO_ID" }
```

Set it to `null` to hide the slot entirely (the team entries do this).

---

## Animation

Framer Motion throughout: route cross-fades, staggered section reveals, counters
that run when scrolled into view, chart bars that grow from the baseline, and
pointer parallax on the hero.

All of it is wrapped in `useReducedMotion()`. With "reduce motion" enabled in
the OS the page renders instantly in its final state with no animation at all.

---

## Structure

```
src/
  app/
    layout.tsx              root shell: header, footer, transitions
    page.tsx                home
    globals.css             tailwind directives
    design-system.css       ← the original stylesheet, untouched
    next-additions.css      styles for the new pages
    api/leads/route.ts      form endpoint
    [routes]/               index + [slug] pages
  components/
    Hero, ResultsPanel, BeforeAfter, Rail, Reveal, Counter,
    SiteHeader, SiteFooter, StickyBar, ContactForm, EntryPage, …
  data/site.json            all content
  lib/content.ts            Supabase-with-fallback loader
  lib/supabase.ts           clients
supabase/
  schema.sql                tables + RLS
  seed.sql                  current content as inserts
```

---

## A note on `.exe` / `.inv`

These were requested but are not applicable: this is a web app, so there is no
executable to ship. It runs from source with `npm run dev`, and deploys to
Vercel, Netlify or any Node host with `npm run build && npm start`.

If you want a desktop wrapper later, the same app can be packaged with Electron
or Tauri — say the word and I will add it.
