# Alchemist 404, round 7: hero button text becomes "Wishlist", then redeploy

One copy change from the owner, then the usual close-out: docs, git, redeploy. Hard rules still apply: no em dashes in copy, WCAG AA, keep the build clean, no other visual changes.

## 1. Rename the hero button

In `site/index.html`, the hero button (`<a class="btn-plaque" ...>`, currently "Discover the game", linking to the Steam page) must read exactly:

    Wishlist

Keep everything else about it unchanged: the element, the `btn-plaque` class, the Steam href with `?beta=1`, `target="_blank"`, `rel="noopener noreferrer"`. Update the screen reader label to match: "Wishlist on Steam (opens in a new tab)".

Replace the old label everywhere it is referenced: grep the repo (excluding node_modules and dist) for "Discover the game" and update `docs/CONTENT.md`, `docs/DESIGN.md` and any other hit. The old string must be gone from the source and the built output.

The shorter text must not look lost on the plaque: check that the button keeps its width and the text stays centered at 360, 768 and 1440. If the plaque shrinks to fit the word and looks too narrow, give the button a sensible min-width matching the previous size. No other styling changes.

## 2. Test

- `npm run dev`: the button reads "Wishlist", click and Tab + Enter open the exact Steam URL in a new tab, focus ring visible, nav anchors and About pager unaffected, no console errors.
- `npm run build` clean. In `dist/index.html`: "Wishlist" present on the button, "Discover the game" absent, zero em dashes.
- Docker: `docker build -t alchemist404 . && docker run -p 8080:8080 alchemist404` serves the renamed button.

## 3. Commit, push, redeploy

- Commit with a clear message and push to `main`.
- Redeploy: `cd site && ./deploy.sh` (it pins the account and project itself, no prefix needed).
- Verify: `curl -s https://alchemist404.com | grep -c 'Wishlist'` is at least 1 and `grep -c 'Discover the game'` is 0, on alchemist404.com, www and the run.app URL. Open the live site in Chrome at 360 and 1440 and confirm the button looks right and opens Steam.
- Report: commit hash, new Cloud Run revision, and a screenshot or description of the button at 360 and 1440.
