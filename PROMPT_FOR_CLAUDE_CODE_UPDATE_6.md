# Alchemist 404, round 6: hero button links to the Steam page, then redeploy

One functional change from the owner, then the usual close-out: docs, git, redeploy. Hard rules still apply (CLAUDE.md, docs/CONSTITUTION.md): no em dashes in copy, WCAG AA, keep the build clean, no visual changes beyond what is asked.

## 1. "Discover the game" button opens the Steam store page

The hero button in `site/index.html` (line ~108):

    <a class="btn-plaque" href="#about">Discover the game</a>

currently scrolls to the About section. Change it so clicking it opens the game's Steam page instead:

    https://store.steampowered.com/app/5232950/Alchemist_404/?beta=1

Requirements:

- Keep it an `<a>` element and keep the `btn-plaque` class, so the look, hover and focus states stay identical. Do not change the button text.
- Open in a new tab: `target="_blank"` with `rel="noopener noreferrer"`. (If the owner prefers same-tab navigation, drop `target`; ask during planning only if unclear.)
- Add an `aria-label` or visually hidden hint such as "Discover the game (opens Steam in a new tab)" so screen reader users know they are leaving the site. Nothing visible changes.
- Check `src/js/main.js`: the `hashchange` / initial-hash reveal logic must keep working for the nav links and `/#hash` loads. The hero button no longer sets a hash, so confirm the About section still reveals correctly when the visitor scrolls to it or uses the nav.
- Search the repo for any other reference to this button's target (`href="#about"` on `btn-plaque`, docs, CONTENT.md) and keep them consistent. Nav links to `#about` stay as they are.
- Optional, invisible: add the Steam URL to the `VideoGame` JSON-LD as `sameAs` (or an `offers.url`). Validate the JSON if you touch it.

## 2. Test

- `npm run dev`: click the button at 360, 768 and 1440. It must open the Steam URL above (exact URL including `?beta=1`) in a new tab; the site stays open in the original tab.
- Keyboard: Tab to the button, Enter opens the link, focus ring still visible.
- Nothing else changed: nav anchors still scroll, About pager still works, no console errors.
- `npm run build` clean. Grep `dist/index.html` for the Steam URL (present once) and for em dashes (zero). Confirm `href="#about"` is gone from the hero button only.
- Lighthouse on mobile still 90+ performance and 90+ accessibility (the external link must not introduce an a11y warning).
- `docker build -t alchemist404 . && docker run -p 8080:8080 alchemist404`: the served page has the new link.

## 3. Sync docs, commit, push, redeploy

- Update `docs/CONTENT.md` (hero CTA now links to Steam, with the URL) and `docs/DESIGN.md` if it describes the button's behavior.
- Commit with a clear message and push to `main` (auth is already set up; if it expired, rerun the web device flow and ask the owner to enter the code).
- Redeploy: `cd site && ./deploy.sh`. Verify https://alchemist404.com serves the new link: `curl -s https://alchemist404.com | grep -o 'store.steampowered.com[^"]*'` must return the URL with `?beta=1`. Also check the Cloud Run run.app URL.
- Report back: commit hash, deploy revision, and confirmation that the live button opens the Steam page.
