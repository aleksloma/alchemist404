# Alchemist 404, round 5: owner's copy fixes, then redeploy

Four small copy changes from the owner, then the usual close-out: docs, git, redeploy. Hard rules still apply: no em dashes, WCAG AA, keep the build clean.

## 1. Hero tagline (replace)

Replace the hero tagline "Master real chemistry. Survive the dungeon." with exactly:

    Master the alchemy. Forge your legend.

This replaces the placeholder everywhere it appears: the hero section, and check whether the same phrase is used in meta description, Open Graph description, or docs. The page meta/OG descriptions can keep their own longer wording, just make sure the old tagline text is gone.

## 2. About pager: remove the third page

The About window currently has 3 pages. Fully remove page 3 ("Every reaction you trigger is inspired by real chemistry, so the deeper you play, the more chemistry you actually know."). The pager becomes 2 pages, wrap-around still works, the dots and counter show "1 / 2" and "2 / 2", and the reserved height is recalculated for the remaining two pages. Do not fold the removed sentence into the other pages; the owner wants it gone.

## 3. Feature card title: drop "System"

The first feature card title "Tag-Based Card System" wraps to two lines and does not fit the plaque. The owner asked to remove the word "System". Use:

    Tag-Based Cards

(pluralized so the title stays grammatical; if you find the singular "Tag-Based Card" was wanted verbatim, ask the owner, but pluralizing is the intended fix). The card body text stays unchanged. Verify the title now fits on one line on the plaque at 360/768/1440.

## 4. Anastasia's bio: remove "action"

In Anastasia (Taso) Gegia's bio, the phrase "educational action-puzzle video game" must become:

    educational puzzle video game

(the word "action" and its hyphen removed, everything else in the bio unchanged). Her bio text lives in the Read bio expander and in docs/CONTENT.md; change it in both so the doc transcription stays the source of truth.

## 5. SEO pass (no visual changes)

Improve search visibility strictly without changing anything the visitor sees. Nothing in this section may alter layout, visible text, colors, or behavior.

- Title and meta: keep the `<title>` under ~60 characters and the meta description 150 to 160 characters, written around the phrases people would actually search: roguelike deckbuilder, chemistry game, educational card game, learn chemistry by playing. Make sure the new tagline wording is reflected where it fits naturally.
- Canonical: add `<link rel="canonical" href="https://alchemist404.com/">` so the run.app URL and www variant never compete with the main domain in search results.
- Social previews: complete the Open Graph tags (og:title, og:description, og:image with absolute https://alchemist404.com URLs, og:url, og:type website, og:site_name) and add Twitter card tags (summary_large_image, twitter:title, twitter:description, twitter:image). Use the existing 1200x630 OG image; a gameplay screenshot variant is fine if it is already in the pipeline.
- Structured data: add JSON-LD in a script tag (invisible to visitors): a `VideoGame` object (name Alchemist 404, description, genre roguelike deckbuilder / educational, gamePlatform PC, author/publisher as the Organization, image, url) and an `Organization` object (name, url, logo, contactPoint with contact@alchemist404.com, sameAs array with the LinkedIn, Facebook, and X profile URLs). Validate the JSON syntax.
- Crawling: add `robots.txt` (allow all, point to the sitemap) and a `sitemap.xml` listing the single page with the canonical URL, served from the site root by nginx. Make sure both are copied into the Docker image.
- Semantics check, markup only: exactly one h1 (the existing sr-only h1 is fine, align its text with the title keywords), section headings as h2 in order, `lang="en"` on the html element, and width/height or aspect-ratio on images so nothing shifts during load (only if not already the case; do not visually change anything).
- After deploy, tell the owner one manual step: in Google Search Console (already verified for alchemist404.com), submit the sitemap URL https://alchemist404.com/sitemap.xml and request indexing for the homepage.

## 6. Sync docs, commit, push, redeploy

- Update docs/CONTENT.md to match all four changes (tagline, About pages now 2, feature title, bio). If DESIGN.md or ARCHITECTURE.md mention the 3-page pager or the old tagline, sync them too. Document the SEO additions (canonical, structured data, robots.txt, sitemap) briefly in docs/ARCHITECTURE.md.
- `npm run build` clean; grep the built HTML for em dashes (zero) and confirm the old strings ("Survive the dungeon", "action-puzzle", "Card System", the removed page 3 sentence) no longer appear in the built output.
- Screenshot-compare before/after at 1440 and 360 to confirm the SEO pass changed nothing visually.
- Commit with a clear message and push to main (auth is already set up; if it expired, rerun the web device flow and ask the owner to enter the code).
- Redeploy: `cd site && ./deploy.sh`. Verify the Cloud Run URL serves the new tagline.
- Check the custom domain state while you are there: `gcloud beta run domain-mappings describe --domain alchemist404.com --region europe-west1`. If the certificate has provisioned, verify https://alchemist404.com and https://www.alchemist404.com serve the updated site and tell the owner the domain is live; if still pending, report the status.
