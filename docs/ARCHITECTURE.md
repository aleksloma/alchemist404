# Architecture: Alchemist 404 Website

## Context and goals

Informational, single-page static website for the Alchemist 404 educational game. Requirements from the owner:

- Runs entirely on GCP
- Domain alchemist404.com (bought on Namecheap, DNS stays there)
- Cheapest option that still works autonomously (no babysitting)
- English only, informational content, no backend features

## High-level design

```
[Visitor] --HTTPS--> alchemist404.com
                        |
                (Namecheap DNS records -> Cloud Run domain mapping)
                        |
                 [GCP Cloud Run service "alchemist404"]
                   nginx container serving /dist (static files)
                   min instances: 0 (scale to zero)
                   max instances: 2
                        |
                 [Artifact Registry]  <-- docker image pushed by deploy.sh
```

Build flow: `src/` -> Vite build -> `dist/` -> Docker image (nginx + dist) -> Artifact Registry -> Cloud Run.

## ADR-001: Hosting model, Cloud Run vs GCS + Load Balancer

**Status:** Accepted (2026-08-21)

**Options considered:**

| | A: GCS bucket + HTTPS Load Balancer + Cloud CDN | B: Cloud Run (nginx container) + domain mapping | C: Firebase Hosting |
|---|---|---|---|
| Monthly cost | ~$18 to $20 minimum (global forwarding rule is billed hourly even at zero traffic) plus CDN egress | ~$0 at this traffic level (Cloud Run free tier: 2M requests/mo, scale to zero); no load balancer needed because domain mapping gives managed SSL directly | ~$0 (free tier) |
| SSL for custom domain | Google-managed cert on the LB | Google-managed cert via Cloud Run domain mapping | Automatic |
| Autonomy | Full | Full (cold start ~1s for nginx, acceptable for an info site) | Full |
| "Everything on GCP" | Yes | Yes | Yes but a separate Firebase console/tooling surface |
| Future flexibility | Static only | Can add server-side later without re-architecture | Limited |

**Decision:** Option B, Cloud Run with an nginx container and a Cloud Run domain mapping for alchemist404.com.

**Why:** It is the cheapest fully-GCP option. Option A's load balancer forwarding rule alone costs more per month than this site's entire expected bill on Cloud Run. A plain GCS bucket without the LB cannot serve HTTPS on a custom domain, so the LB is not optional in option A. Cloud Run's free tier covers an informational site's traffic many times over, scale-to-zero means no idle cost, and managed certificates renew automatically, so it runs autonomously.

**Consequences:** A cold start of roughly a second can occur after idle periods; acceptable for this site. If Cloud Run domain mapping is unavailable in the chosen region, fall back to region `europe-west1` (supported) or, as a last resort, add a global external Application Load Balancer with a serverless NEG (accepting option A's cost).

## ADR-002: Frontend stack, Vite + vanilla

**Status:** Accepted (2026-08-21)

One informational page with sections does not need a framework. Vite gives dev server, asset hashing, and minification; vanilla HTML/CSS/JS keeps the payload tiny and the project maintainable by anyone. React/Astro/Next were rejected as unnecessary complexity (see Constitution, Article 2).

## Repository structure

```
alchemist/
├── CLAUDE.md
├── docs/                        # this documentation set
├── Alchemist website photos and bios/   # RAW team photos + bios (read-only inputs)
├── საიტის ვიზუალები/                    # RAW visual assets (read-only inputs)
├── site/                        # the actual web project (created by Claude Code)
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── scripts/
│   │   └── process-assets.mjs   # sharp: raw assets -> optimized web assets
│   ├── src/
│   │   ├── styles/main.css
│   │   ├── js/main.js
│   │   └── assets/
│   │       ├── img/             # processed WebP/PNG (logo, bg, frames, team, screenshots)
│   │       └── fonts/           # ComicRelief-Regular.ttf/Bold.ttf (+woff2) + OFL.txt
│   ├── public/                  # favicon.ico, favicon.png, robots.txt
│   ├── Dockerfile               # multi-stage: node build -> nginx:alpine
│   ├── nginx.conf               # gzip, cache headers, listens on 8080
│   └── deploy.sh                # build, push to Artifact Registry, deploy to Cloud Run
```

## Asset pipeline

`scripts/process-assets.mjs` (run via `npm run assets`) reads the raw folders at the repo root and writes optimized outputs to `src/assets/img/`, `src/assets/fonts/`, and `public/`:

- Resize: background to 1920/960px wide, logo to 800px, frames to their displayed size x2, team photos to 640px square-cropped
- Gameplay screenshots (from `screnshots + additional info/`): 1600px and 800px wide, WebP + JPEG
- About pager pressed gems: pink gem sprites cropped (half-canvas + trim) from the `Turorial_Window_butons*` variants, 140px, WebP + PNG
- Convert to WebP quality ~80; keep PNG (transparent) fallback for frames/logo/gems where transparency is needed
- Favicon: derive 32/180/512 px PNGs + .ico from the favicon source; also a 1200x630 og-logo.png for Open Graph
- Fonts: unzip Comic Relief (fflate), generate .woff2 (wawoff2), keep OFL.txt

The script must handle the Georgian and accented file names (use directory listing, not hard-coded glob strings, and normalize Unicode). Frame overlay coordinates in `src/styles/main.css` were pixel-measured from the processed frame art (parchment/gem bounding boxes); re-measure if frame assets change.

## Interactive components (vanilla JS, `src/js/main.js`)

- Burger nav (aria-expanded, Escape closes)
- Scroll reveal (IntersectionObserver + explicit reveal on load/hashchange/scrollend, motion-safe)
- Screenshots carousel: one framed slide at a time, infinite wrap, autoplay 5s (pauses on hover/keyboard-focus/hidden tab, resumes ~10s after pointer interaction, killed permanently by keyboard use, disabled under prefers-reduced-motion), dots + live counter, neighbor-slide preload, lightbox via native dialog (focus trap, Escape, arrow keys)
- About pager: 2 pages inside the tutorial-window frame; the frame's arrow gems are transparent buttons with the game's pink pressed-gem art shown on press; wrap-around, dots + live counter, arrow keys; under 700px the frame falls back to a parchment panel with circular arrow buttons

## SEO

All invisible to visitors, in `index.html` head and `public/`:

- Canonical `https://alchemist404.com/`; title under 60 chars; meta description 150-160 chars around "roguelike deckbuilder", "chemistry game", "educational card game", "learn chemistry by playing"
- Open Graph (og:image 1200x630 `public/og-logo.png` with absolute URLs) and Twitter summary_large_image tags
- JSON-LD `@graph` with `VideoGame` and `Organization` (contact email, sameAs social profiles)
- `public/robots.txt` (allow all + Sitemap line) and `public/sitemap.xml` (single canonical URL); both land in dist/ and the Docker image automatically; nginx serves .xml with cache headers
- One sr-only h1 carrying the title keywords; section headings are h2

## Data flow and integration points

- No runtime data flows. Everything is baked at build time.
- DNS: Namecheap Advanced DNS -> records provided by the Cloud Run domain mapping (see DEPLOYMENT.md).
- CI (optional, later): Cloud Build trigger on git push to main running deploy.sh steps. Not required for milestone 1.

## Non-goals

Newsletter signup, contact forms, download counters, localization, blog, game distribution (the site links out to stores/platforms when those exist).
