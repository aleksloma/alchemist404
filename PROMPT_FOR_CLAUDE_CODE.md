# Prompt for Claude Code

Run Claude Code in the `alchemist` folder (the one containing CLAUDE.md), then paste this prompt:

---

Read CLAUDE.md and every file in docs/ (CONSTITUTION.md first), then build milestone 1 of the Alchemist 404 website.

Steps:

1. Scaffold the web project in `site/` exactly per the repository structure in docs/ARCHITECTURE.md (Vite, vanilla HTML/CSS/JS, no framework).
2. Write `site/scripts/process-assets.mjs` using sharp, and run it: process the raw images from "Alchemist website photos and bios/" and "საიტის ვიზუალები/" into optimized WebP/PNG in `site/src/assets/img/` at the sizes given in docs/ARCHITECTURE.md, generate the favicon set from the favicon source, and unzip Comic Relief fonts (with OFL.txt) into `site/src/assets/fonts/`. The raw folders are read-only inputs; never modify them, never import from them at runtime. Handle Georgian and accented filenames by listing directories, not hard-coding names, and normalize Unicode (NFC/NFD) when matching.
3. Build the single-page site with the exact sections, layout, and component techniques described in docs/DESIGN.md, using only the color tokens and typography defined there. All copy, team order, bios, and placeholder rules come from docs/CONTENT.md verbatim. No em dashes anywhere in site copy.
4. Follow every rule in docs/CONSTITUTION.md, especially: static only, page weight under 2.5 MB, lazy-loading, semantic HTML, alt text, keyboard navigation, WCAG AA contrast, mobile-first at 360/768/1440.
5. Create `site/Dockerfile` (multi-stage: node build then nginx:alpine on port 8080 with gzip, cache headers, and `try_files $uri $uri/ /index.html;`), `site/nginx.conf`, and `site/deploy.sh` matching docs/DEPLOYMENT.md. Do not run any gcloud commands; deployment happens later, manually.
6. Verify: `npm run build` succeeds with no errors; run the dev server and confirm it works; if a browser tool is available, screenshot the page at 360px and 1440px widths and check every section renders (frames aligned around photos and text, background art visible, fonts loading); fix what's broken. Add basic SEO: title, meta description, Open Graph tags with the logo image.
7. When done, start `npm run dev` and tell me the localhost URL to open, plus a short list of what was built and any placeholders that still need real content (per the "Missing content" list in docs/CONTENT.md).

---

Tip: after it finishes, check the site at http://localhost:5173, then ask Claude Code for changes ("make the hero logo bigger", "reorder team members", etc.). When you are happy, follow docs/DEPLOYMENT.md to put it on GCP and connect alchemist404.com.
