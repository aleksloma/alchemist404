# Alchemist 404 site, update round 2

Read `docs/CONSTITUTION.md`, `docs/CONTENT.md`, and `docs/DESIGN.md` first. All hard rules still apply: static only, page weight under 2.5 MB on first load, lazy-load below the fold, no em dashes in copy, WCAG AA, alt text on every image, mobile-first (test 360/768/1440).

New source material has arrived in the folder `screnshots + additional info/` at the repo root (note the folder name is spelled exactly like that). It contains:

- `About.pdf`: the official game description, feature list, and contact details. Treat this as the new source of truth for game copy and contacts. Transcribe the relevant text into `docs/CONTENT.md` so the docs stay authoritative, then update the site from it.
- `image.png`, `image (1).png` ... `image (4).png`: five real gameplay screenshots, 1920x1080 (combat scenes, a rewards screen, and an overworld map). These replace the placeholder crops of the background art.

## 1. Update the game description and features (copy change)

`About.pdf` describes the game differently from the current site copy. The game is: "an experimental roguelike deckbuilder inspired by real-world chemistry", where you are isekai'd into a fantasy world and fight elemental dragons with a deck built around sword mastery. Update the About section text and page meta description accordingly. Keep the educational chemistry angle, it is still the site's hook, but stop calling it an "action-puzzle" game.

Replace the four current feature cards with the four real features from About.pdf, light copyedit only, no em dashes:

1. Tag-Based Card System: cards are defined by tags and effects instead of fixed damage numbers, so your hero's stats determine how powerful they become.
2. Slot-Based Combat: place cards into different slots to predict, counter, and outplay your enemy's actions.
3. Simultaneous Turns: plan your moves, commit your cards, then reveal the enemy's hidden actions and watch both sides resolve at once.
4. Alchemy & Reactions: combine elements to trigger reactions inspired by real-world chemistry.

While you are in that section: the feature cards currently look flat, plain dark boxes with a thin border and a lot of empty space around them. Give them more visual weight consistent with DESIGN.md (use the plaque/frame treatment or richer card styling), and tighten the large vertical gaps between sections across the page.

## 2. Real screenshots, displayed much bigger

Process the five PNGs through the asset pipeline (WebP with JPEG fallback, no transparency involved) at two sizes each: a display size around 1600px wide and a thumbnail around 800px wide. Never ship the raw PNGs. Watch the 2.5 MB first-load budget: only thumbnails load with the page (lazy-loaded), the large versions load on demand.

The current screenshot presentation is too small to understand the game: three ~280px thumbnails in one row. Replace it with a carousel that shows ONE large screenshot at a time (owner's explicit request):

- One screenshot visible at a time, large: roughly 1000 to 1200px wide on desktop (16:9), centered, keeping the gold frame treatment. On mobile it spans the full content width.
- Left and right arrow buttons to move between screenshots. The carousel is continuous / infinite: from the last screenshot, "next" wraps to the first, and from the first, "previous" wraps to the last. It never dead-ends.
- Autoplay: advance automatically every 5 seconds. Pause autoplay on hover, on focus within the carousel, and after any manual interaction (resume after ~10 seconds of inactivity or not at all, your call). Respect prefers-reduced-motion: no autoplay if the user prefers reduced motion.
- Add small dot or counter indicators (e.g. 3 / 5) so the user knows where they are.
- Accessibility: the carousel container gets aria-roledescription="carousel", arrows are real buttons with aria-labels and visible focus states, left/right arrow keys work when the carousel has focus, and autoplay stops permanently once the user interacts via keyboard.
- Optional but nice: clicking the large screenshot opens the ~1600px version in a simple lightbox (dark overlay, close button, Escape to close). Vanilla JS, no library.
- Give each screenshot a short caption and a descriptive alt text based on what it shows: slot-based combat against an elemental dragon, the card hand with Strike/Shield/Forward Thrust cards, the rewards screen with element and shield pickups, the overworld map with fight and camp nodes, and so on.
- Remove the "Real gameplay screenshots are coming soon" note.
- Lazy-load everything except the first slide so the first-load budget holds.

## 3. Team section: make Dragadin consistent

Every team member currently has a "Read bio" expander except Dragadin, whose one-line bio is shown inline in a different style, which breaks the grid rhythm. Put Dragadin's short bio inside the same "Read bio" expander component as everyone else, so all six cards are visually identical when collapsed. Keep the bio text as-is from `docs/CONTENT.md` (light copyedit only).

## 4. Footer: real contact and social links

Replace "Contact email coming soon." with real contacts from About.pdf:

- Email: contact@alchemist404.com as a mailto link.
- Social links: LinkedIn, Facebook, and X. Do not print the raw URLs. Render each as its official logo icon (inline SVG, monochrome, styled to match the footer, roughly 24 to 28px, with the brand name as aria-label and a visible focus state), linked with target="_blank" and rel="noopener".
  - LinkedIn: https://www.linkedin.com/company/alchemist-404/ (strip the ?viewAsMember query parameter)
  - Facebook: https://www.facebook.com/profile.php?id=61588250737892
  - X: https://x.com/Alchemist404Dev
- Do not publish the personal email or the phone number on the site unless the owner asks for it.

Also add these contacts and social URLs to `docs/CONTENT.md`.

## 5. Bug: anchor navigation lands on the wrong section

Clicking "Features" in the nav scrolls past the Features section, the viewport ends up showing the Screenshots heading. Fix the anchor offset (scroll-margin-top on the section anchors matching the fixed nav height, and check section padding) so each nav link lands with the section heading visible just below the nav. Verify all five nav links.

## 6. Bug: sections are invisible after anchor jumps

The scroll-reveal animation does not fire when arriving via an anchor jump: after clicking "Team" or loading `/#features` directly, the section content stays hidden (opacity 0) until the user manually scrolls, so the page looks empty. Fix the reveal logic so elements already in the viewport are revealed immediately, including on hashchange and on initial page load with a hash. Keep the prefers-reduced-motion behavior.

## Verification

- All five nav anchors land correctly and every section is visible immediately, including when loading URLs with a hash directly.
- Lightbox: open, close, Escape, arrows, focus trap, works at 360/768/1440.
- `npm run build` clean, first-load weight still under 2.5 MB, grep the built HTML for em dashes (must be zero).
- Lighthouse still 90+ performance and accessibility on mobile.
- Docker image still builds and serves correctly.
