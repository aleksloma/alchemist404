# CLAUDE.md - Alchemist 404 Website

## What this project is

An informational website for **Alchemist 404**, an experimental roguelike deckbuilder inspired by real-world chemistry that teaches real chemistry reactions through gameplay. The site presents the game, its features, screenshots, and the team behind it.

- Live domain: **alchemist404.com** (registered on Namecheap, DNS points to GCP)
- Hosting: **GCP Cloud Run** (nginx container serving a static build, scale to zero), project `alchemist404`, region `europe-west1`
- Git: **https://github.com/aleksloma/alchemist404.git**, branch `main` (workflow in `docs/DEPLOYMENT.md`)
- Language: **English only**
- Type: static informational site. No backend, no database, no user accounts.

## Read these docs before coding

| Doc | Purpose |
|---|---|
| `docs/CONSTITUTION.md` | Non-negotiable project rules. Read first. |
| `docs/ARCHITECTURE.md` | Tech stack, repo structure, hosting decision (ADR) |
| `docs/DESIGN.md` | Visual identity, colors, typography, components |
| `docs/CONTENT.md` | Page structure, all site copy, team bios, asset inventory |
| `docs/DEPLOYMENT.md` | Localhost, Docker, Cloud Run, Namecheap DNS runbook, git workflow |

## Source assets (do not edit originals)

Raw assets live in two folders at the repo root. Folder names are in Georgian; the mapping is documented in `docs/CONTENT.md`:

- `Alchemist website photos and bios/` : team photos (.jpg/.png) and bios (.docx, already transcribed into `docs/CONTENT.md`)
- `საიტის ვიზუალები/` ("site visuals") : background art, logo, favicon source, UI frames, button, Comic Relief font zip

Originals are huge (5000px+ PNGs, up to 14 MB photos). **Never ship them as-is.** Process them into `src/assets/` at web sizes (WebP + PNG fallback where transparency matters). See the asset pipeline in `docs/ARCHITECTURE.md`.

## Tech stack

- **Vite** + vanilla HTML/CSS/JS (no framework). Single page, section anchors.
- **Comic Relief** font, self-hosted (extract from `საიტის ვიზუალები/ტექსტის ფონტი/Comic_Relief.zip`, includes OFL license, keep `OFL.txt`).
- **nginx** in Docker for production serving.
- **Cloud Run** for hosting, **Namecheap DNS** for the domain.

## Commands

```bash
npm install          # install deps
npm run assets       # one-time: process raw assets into src/assets (sharp script)
npm run dev          # localhost dev server (http://localhost:5173)
npm run build        # production build into dist/
npm run preview      # serve dist/ locally
docker build -t alchemist404 . && docker run -p 8080:8080 alchemist404   # prod parity test
```

## Hard rules (summary, full list in CONSTITUTION.md)

1. Static only. No server-side code, no CMS, no analytics that require consent banners.
2. Everything runs on GCP and must work autonomously (scale to zero, no manual upkeep).
3. Keep total page weight under 2.5 MB on first load. Lazy-load below-the-fold images.
4. All images processed and optimized, never the raw source files.
5. Site copy in English. Do not use em dashes in copy, use commas, colons, or periods.
6. Team bios in `docs/CONTENT.md` are the source of truth. Do not rewrite them, only light copyedit.
7. Mobile-first responsive. Test at 360px, 768px, 1440px.
8. Accessibility: semantic HTML, alt text on all images, visible focus states, WCAG AA contrast for text.

## Definition of done for the first milestone

- `npm run dev` shows the full site on localhost with all sections from `docs/CONTENT.md`
- Lighthouse: 90+ performance, 90+ accessibility on mobile
- Docker image builds and serves the same site on port 8080
- Deployment to Cloud Run documented and scripted (`deploy.sh`), see `docs/DEPLOYMENT.md`
