# Deployment runbook: Alchemist 404 Website

This describes the deployment as it actually is, set up on 2026-08-21. Use it for redeploys, DNS checks, and picking the project up in a future session.

## What is deployed where

| Item | Value |
|---|---|
| GCP account | aleksloma@gmail.com (owner's personal account) |
| GCP project | `alchemist404` (project number 945483496927) |
| Region | `europe-west1` (supports Cloud Run domain mappings, close to Europe/Georgia) |
| Cloud Run service | `alchemist404` |
| Service URL | https://alchemist404-945483496927.europe-west1.run.app |
| Domain | alchemist404.com + www.alchemist404.com (Namecheap DNS, Cloud Run domain mapping) |
| Build | Cloud Build from source (`gcloud run deploy --source`), using `site/Dockerfile` |
| Enabled APIs | run.googleapis.com, cloudbuild.googleapis.com, artifactregistry.googleapis.com |

## Authentication

No tokens or keys are stored anywhere in the repo or on disk beyond gcloud's own credential store.

```bash
gcloud auth login aleksloma@gmail.com   # opens the browser; repeat only if the token expires
```

No `gcloud config set project` is needed. `site/deploy.sh` pins its own account and project by exporting `CLOUDSDK_CORE_ACCOUNT=aleksloma@gmail.com` and `CLOUDSDK_CORE_PROJECT=alchemist404` for its own process, and passes `--project alchemist404` explicitly. It works whichever account or project is active globally (the owner regularly switches to founder@powerdatachat.com / pdc-enterprise for other work), and it never modifies the global gcloud account or project. If aleksloma@gmail.com is not in `gcloud auth list`, the script stops before building with:

```
ERROR: aleksloma@gmail.com is not authenticated in gcloud.
Run once:  gcloud auth login aleksloma@gmail.com
```

For ad hoc gcloud commands against this project, use the same pinning instead of switching the global config:

```bash
CLOUDSDK_CORE_ACCOUNT=aleksloma@gmail.com gcloud run services describe alchemist404 --project alchemist404 --region europe-west1
```

The Google Cloud CLI on this machine is installed at `%LOCALAPPDATA%\Google\Cloud SDK\google-cloud-sdk\bin` (installed via winget, may not be on PATH in every shell).

## How to redeploy after changes

```bash
cd site
./deploy.sh
```

That script checks that aleksloma@gmail.com is authenticated, prints `==> Deploying as aleksloma@gmail.com to project alchemist404`, runs `npm run build` as a local sanity check, then:

```bash
gcloud run deploy alchemist404 \
  --project alchemist404 \
  --source . \
  --region europe-west1 \
  --allow-unauthenticated \
  --min-instances 0 --max-instances 2 \
  --memory 256Mi --cpu 1 --port 8080
```

Cloud Build builds `site/Dockerfile` (node build stage then nginx:alpine) and deploys the new revision. `site/.gcloudignore` keeps node_modules/dist out of the upload. Scale-to-zero keeps the cost at ~$0 for this traffic level.

Note: `npm run assets` is a one-time local step; the processed assets in `site/src/assets/` are committed, and neither Docker nor Cloud Build runs the asset pipeline (the raw art folders are outside the build context).

## Verify a deploy

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://alchemist404-945483496927.europe-west1.run.app   # expect 200
curl -s -I -H "Accept-Encoding: gzip" https://alchemist404-945483496927.europe-west1.run.app | grep -i content-encoding   # gzip
```

Then click through all sections (About pager, carousel, team, footer).

## Custom domain: alchemist404.com (DONE, 2026-08-21)

All steps completed on 2026-08-21:

1. Domain ownership verified in Google Search Console (Domain property for alchemist404.com, `google-site-verification` TXT record added at Namecheap by the owner; `gcloud domains list-user-verified` shows the domain).
2. Domain mappings created on the Cloud Run service:
   ```bash
   gcloud beta run domain-mappings create --service alchemist404 --domain alchemist404.com --region europe-west1
   gcloud beta run domain-mappings create --service alchemist404 --domain www.alchemist404.com --region europe-west1
   ```
3. DNS records configured at Namecheap (Advanced DNS). The records Google's mappings require matched these exactly, and public DNS already resolves them:

| Type | Host | Value |
|---|---|---|
| A | @ | 216.239.32.21 |
| A | @ | 216.239.34.21 |
| A | @ | 216.239.36.21 |
| A | @ | 216.239.38.21 |
| AAAA | @ | 2001:4860:4802:32::15 |
| AAAA | @ | 2001:4860:4802:34::15 |
| AAAA | @ | 2001:4860:4802:36::15 |
| AAAA | @ | 2001:4860:4802:38::15 |
| CNAME | www | ghs.googlehosted.com. |
| TXT | @ | google-site-verification=... (Search Console value) |

Certificate status at time of writing: `DomainRoutable` True, `CertificateProvisioned` pending (Google provisions automatically once it observes the DNS; typically 15 minutes to a few hours).

SSL: Google provisions and renews the certificate automatically once DNS propagates (minutes to a few hours). Nothing to maintain.

Status checks:

```bash
gcloud beta run domain-mappings describe --domain alchemist404.com --region europe-west1
# ready when the CertificateProvisioned condition is True
```

## Problems hit during setup (so they are not rediscovered)

- First `gcloud run deploy --source` failed with `PERMISSION_DENIED ... IAM permission denied for service account 945483496927-compute@developer.gserviceaccount.com`. On new projects the default compute service account lacks Cloud Build permissions. Fix (one-time):
  ```bash
  gcloud projects add-iam-policy-binding alchemist404 \
    --member=serviceAccount:945483496927-compute@developer.gserviceaccount.com \
    --role=roles/cloudbuild.builds.builder --condition=None
  ```
- Billing was already linked to the project, so enabling APIs worked directly. If a future project shows billing errors: Console -> Billing -> Link a billing account.

## Rollback

```bash
gcloud run revisions list --service alchemist404 --region europe-west1
gcloud run services update-traffic alchemist404 --region europe-west1 --to-revisions REVISION_NAME=100
```

## Git workflow

- Repo: **https://github.com/aleksloma/alchemist404.git**, branch **main**, GitHub account **aleksloma**. Initial push completed 2026-08-21 (commits `d2f46f0`, `b7a17e4`, `622be71`).
- Committed: docs, raw asset folders, `site/` sources (including processed `site/src/assets/`), deployment files. Ignored (see root `.gitignore` and `site/.gitignore`): `node_modules/`, `dist/`, `.vite/`, editor/OS cruft. Root `.gitattributes` forces LF on `*.sh`, `Dockerfile`, `*.conf` so Linux builds do not choke on CRLF.
- Authentication: GitHub CLI web flow, no tokens stored in the repo:
  ```bash
  gh auth login --web --git-protocol https   # one-time; browser + one-time code
  ```
  (Fallback without gh: plain `git push` triggers Git Credential Manager's browser sign-in.)
- Day-to-day flow:
  ```bash
  git add -A && git commit -m "..."
  git push
  cd site && ./deploy.sh    # redeploy to Cloud Run
  ```

## Cost expectations

Cloud Run free tier (2M requests, scale to zero) covers this site; expected bill ~$0, worst case cents. Artifact Registry stores the build images for cents. A $5/mo budget alert in Billing -> Budgets is a sensible tripwire.
