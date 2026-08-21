# Alchemist 404 site, update round 3: About pager, polish, then ship

Read `docs/CONSTITUTION.md`, `docs/CONTENT.md`, `docs/DESIGN.md`, and `docs/DEPLOYMENT.md` first. All hard rules still apply: static only, first load under 2.5 MB, lazy-load below the fold, no em dashes in copy, WCAG AA, alt text everywhere, test at 360/768/1440.

This round has three parts: (1) make the About window a working pager, (2) small polish fixes, (3) push the repo to GitHub and deploy to Cloud Run for real. Do them in that order and verify the site before deploying.

## 1. About window: working left/right pager (owner's request)

The tutorial-window frame in the About section shows left and right arrow buttons, but they are decorative art and do nothing when clicked. The owner wants them functional: split the About text into two or three short logical pages and page through them with those arrows. Smaller chunks of text are easier to read at once. Suggested split, adjust wording from `docs/CONTENT.md` as needed:

- Page 1, what it is: Alchemist 404 is an experimental roguelike deckbuilder inspired by real-world chemistry.
- Page 2, the story: isekai'd into a fantasy world, you fight elemental dragons with a deck built around sword mastery and become the hero you were never supposed to be.
- Page 3, why it teaches: every reaction you trigger is inspired by real chemistry, so the deeper you play, the more chemistry you actually know.

Implementation requirements:

- The clickable areas are the two arrow gems already visible in the frame art. Make them real `<button>` elements positioned over the frame (transparent hit area sized generously, at least 44x44 px), with aria-labels ("Previous page", "Next page") and visible focus states.
- Pressed state must use the game's own art (owner's request). The raw assets folder `საიტის ვიზუალები/აღწერის ფანჯარა/` contains the button states: `Turorial_Window_butons.png` is the arrow bar with both gems green (idle), `Turorial_Window_butons Left .png` shows the LEFT gem turned pink/red (left pressed), and `Turorial_Window_butonsright.png` shows the RIGHT gem turned pink/red (right pressed). Run these through the asset pipeline (crop to just the arrow gems if that is cleaner, WebP + PNG for transparency, 2x display size) and swap the pressed art in on `:active` / pointer-down, reverting on release. A brief pressed flash (~150ms) on click is fine so the state is visible even on fast taps.
- Wrap around: next from the last page goes to page 1, previous from page 1 goes to the last page, consistent with the screenshot carousel.
- Add a small page indicator (dots or "1 / 3") inside or just under the window, styled to match.
- Text changes swap instantly or with a short fade; the window height must not jump between pages (reserve height for the tallest page). Announce page changes politely to screen readers (aria-live="polite"), and make left/right arrow keys work when focus is inside the pager.
- The under-600px fallback (parchment panel without the frame) gets the same pager with the same buttons rendered as styled buttons, or simply shows all pages stacked if that reads better on mobile; your call, but the arrows must never appear and do nothing.

## 2. Polish fixes from browser review

- Carousel edge artifacts: at desktop widths, dark fragments of the neighboring slides peek out from behind the gold frame on the left and right edges of the screenshot carousel (small dark rectangles sticking out mid-height). Clip or hide inactive slides completely (overflow hidden on the viewport wrapper, or opacity/visibility on non-active slides) so nothing shows outside the frame.
- Verify carousel autoplay resumes after pointer interaction as designed (it appeared to stay paused on one slide during testing; confirm the resume timer actually fires when the pointer leaves the carousel).
- Preload the next slide's image when a slide becomes active, so arrow clicks never show a blank frame.

## 3. Push to GitHub

The owner created the repo: `https://github.com/aleksloma/alchemist404.git` (GitHub account: aleksloma).

- Initialize git in the project root if not already initialized. Add a sensible `.gitignore` before the first commit: `node_modules/`, `dist/`, `site/node_modules/`, `site/dist/`, editor cruft. The raw asset folders and docs are part of the repo and should be committed.
- Commit everything with a clear message, add the remote, push to `main`.
- Authentication: do not ask the owner for tokens or passwords. Use a web-based flow: if the `gh` CLI is available (or installable), run `gh auth login --web --git-protocol https` and let the owner complete authorization in the browser; otherwise push and let Git Credential Manager pop up its browser sign-in. Tell the owner when a browser window needs their attention.

## 4. Deploy to Cloud Run (GCP)

Follow `docs/DEPLOYMENT.md` and the existing `site/deploy.sh`, updating them with the real project values:

- GCP project ID: `alchemist404` (project number 945483496927), owned by the owner's personal account `aleksloma@gmail.com`.
- Authorization: run `gcloud auth login` and let the owner authorize via the browser (they have agreed to do this). If gcloud is not installed on this machine, install the Google Cloud CLI first. After login, `gcloud config set project alchemist404`.
- Enable the required APIs (`run.googleapis.com`, `cloudbuild.googleapis.com`, `artifactregistry.googleapis.com`). If anything fails because billing is not enabled on the project, stop and tell the owner exactly what to click in the console, then continue after they confirm.
- Build and push the image (Cloud Build straight from source is simplest: `gcloud run deploy` with `--source`, or build the existing Dockerfile via Cloud Build into Artifact Registry), then deploy to Cloud Run with `--allow-unauthenticated`, port 8080, minimum instances 0. Pick a region that supports Cloud Run domain mappings and is reasonably close to Georgia/Europe (e.g. `europe-west1` or `europe-west4`); record the chosen region in `docs/DEPLOYMENT.md`.
- Verify the `.run.app` URL serves the site correctly (HTTP 200, gzip, cache headers, all sections render).
- Domain `alchemist404.com` (bought on Namecheap, DNS stays at Namecheap): set up the Cloud Run domain mapping for `alchemist404.com` and `www.alchemist404.com`. This requires domain verification with the owner's Google account and DNS records at Namecheap. Print, clearly and in one block, the exact DNS records the owner must add in the Namecheap dashboard (A/AAAA records for the apex and CNAME for www, plus any verification TXT record), and explain that SSL certificates provision automatically after DNS propagates. Do not attempt to change Namecheap DNS yourself; the owner does that part.
- Update `docs/DEPLOYMENT.md` with everything as actually deployed: project ID, region, service name, the DNS records, and the redeploy one-liner for future updates.

## 5. Update the documentation

After the work above is done, bring the docs fully up to date so any future session can pick the project up from the docs alone:

- `docs/DEPLOYMENT.md`: rewrite it to describe the deployment as it actually is, not as planned. Include: GCP account (aleksloma@gmail.com), project ID `alchemist404` and project number 945483496927, region chosen, service name, how authentication is done (`gcloud auth login` web flow), the APIs that were enabled, the exact build-and-deploy command(s) used, the Cloud Run service URL, the domain mapping setup for alchemist404.com and www, the DNS records that were given to the owner for Namecheap, how to check certificate/DNS status, and a short "how to redeploy after changes" section (ideally one command or `./deploy.sh`). Also note anything that failed and how it was resolved (billing, permissions), so it is not rediscovered next time.
- Add a git section to the docs (in `docs/DEPLOYMENT.md` or a new `docs/GIT.md`, your call, linked from CLAUDE.md): the repo URL `https://github.com/aleksloma/alchemist404.git`, the branch used (`main`), what is committed vs ignored (`.gitignore` contents and why), how authentication works (web flow, no tokens stored in the repo), and the day-to-day flow: commit, push, then redeploy to Cloud Run.
- `README.md` at the repo root (create if missing): one-paragraph project description, prerequisites, how to run locally (`npm install`, `npm run dev`), how to build, how to deploy (pointing at docs/DEPLOYMENT.md). Keep it short; details live in docs/.
- Sync any other doc that this round made stale: `docs/ARCHITECTURE.md` (About pager component, carousel changes), `docs/CONTENT.md` (About text now split into pages), and CLAUDE.md if it lists the docs. No em dashes in any of these files either.

## Verification before finishing

- About pager: arrows page through all pages both directions with wrap-around, pressed art shows on click, keyboard works, indicator updates, no layout jump, works at 360/768/1440.
- Carousel: no slide fragments visible outside the frame; autoplay resumes after pointer interaction.
- `npm run build` clean, zero em dashes in built HTML, first load still under 2.5 MB, Lighthouse mobile still 90+ performance and 100 accessibility.
- Git: `git log` shows the commit, remote push succeeded, repo visible on GitHub.
- Cloud Run: service URL returns the working site; domain mapping created and DNS instructions delivered to the owner.
- Docs: DEPLOYMENT.md matches what was actually deployed, the git workflow is documented, README exists, and no doc references the old placeholder project values.
