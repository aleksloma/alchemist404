# Constitution: Alchemist 404 Website

These are the non-negotiable rules of the project. Every change must comply. If a requested change conflicts with a rule here, stop and raise it instead of silently breaking the rule.

## Article 1: Purpose

The site exists to present the Alchemist 404 educational game to players, parents, teachers, and potential partners. It informs. It does not sell, track, or collect personal data.

## Article 2: Simplicity

1. Static site only. No backend, no database, no user accounts, no forms that post to a server.
2. No JS framework (no React/Vue/etc.). Vite + vanilla HTML/CSS/JS is the ceiling of complexity.
3. Every dependency must justify itself. Prefer zero-dependency solutions.

## Article 3: Cost and autonomy

1. Everything runs on GCP. Monthly cost target: within the Cloud Run free tier (about $0 for this traffic level).
2. The site must run autonomously: scale to zero, managed SSL, no cron jobs, no manual restarts, nothing to babysit.
3. No paid third-party services. Fonts are self-hosted, no external CDNs required at runtime.

## Article 4: Performance

1. First load under 2.5 MB total, under 1 MB is the goal for the critical path.
2. All raster images served as optimized WebP (PNG fallback only where needed), sized to at most 2x their largest displayed size.
3. Below-the-fold images use `loading="lazy"`. Hero/logo images are preloaded.
4. Lighthouse mobile scores: Performance 90+, Accessibility 90+, Best Practices 90+, SEO 90+.

## Article 5: Brand and content

1. The visual identity comes from the game's own assets (see DESIGN.md): dark fantasy, ornate gold frames, gem-green accents, purple dusk sky. Do not invent a different style.
2. Comic Relief is the only display font. Keep its OFL.txt license file in the repo and ship it with the font.
3. Site copy is English. No em dashes in copy, use commas, colons, or periods.
4. Team bios come verbatim from docs/CONTENT.md. Light copyedit only (typos, capitalization). Never fabricate facts about team members or the game.
5. Raw source assets are read-only inputs. Never modify or delete them, never commit multi-megabyte originals into the served site.

## Article 6: Accessibility and quality

1. Semantic HTML5 landmarks (header, nav, main, section, footer).
2. Every image has meaningful alt text, decorative frames use empty alt.
3. Text contrast meets WCAG AA against its actual background.
4. The site is fully usable with keyboard only, focus states visible.
5. Works on mobile from 360px width up. Test 360 / 768 / 1440.

## Article 7: Deployment discipline

1. Production is only ever deployed from a successful local build plus Docker test.
2. `deploy.sh` is the single deployment path. No hand-run one-off gcloud commands for production changes.
3. DNS for alchemist404.com stays on Namecheap, pointed at GCP per docs/DEPLOYMENT.md. Do not transfer the domain.
4. Any architectural change (hosting model, stack) requires a new ADR in docs/ARCHITECTURE.md before implementation.
