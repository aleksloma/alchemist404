# Deployment runbook: Alchemist 404 Website

When to use: first deployment to GCP, later redeployments, and DNS setup on Namecheap.

## Prerequisites

- GCP account with billing enabled, `gcloud` CLI installed and logged in
- Docker installed locally
- Access to the Namecheap account that owns alchemist404.com
- Milestone 1 done: site builds locally and passes the Docker test

## 0. One-time GCP setup

```bash
gcloud projects create alchemist404-site --name="Alchemist 404"
gcloud config set project alchemist404-site
# link billing (replace with your billing account id: gcloud billing accounts list)
gcloud billing projects link alchemist404-site --billing-account=XXXXXX-XXXXXX-XXXXXX
gcloud services enable run.googleapis.com artifactregistry.googleapis.com
gcloud artifacts repositories create web --repository-format=docker \
  --location=europe-west1 --description="alchemist404 images"
```

Region: `europe-west1` (close to Georgia among Cloud Run domain-mapping supported regions; verify domain mapping support at deploy time, otherwise pick another supported region).

## 1. Local verification (every deploy)

```bash
cd site
npm run build
docker build -t alchemist404 .
docker run --rm -p 8080:8080 alchemist404
# open http://localhost:8080 and click through all sections
```

## 2. Deploy (scripted in deploy.sh)

```bash
REGION=europe-west1
IMG=$REGION-docker.pkg.dev/alchemist404-site/web/alchemist404:$(git rev-parse --short HEAD)
gcloud auth configure-docker $REGION-docker.pkg.dev
docker build -t $IMG .
docker push $IMG
gcloud run deploy alchemist404 \
  --image $IMG --region $REGION \
  --allow-unauthenticated \
  --min-instances 0 --max-instances 2 \
  --memory 256Mi --cpu 1 --port 8080
```

Verify on the printed `*.run.app` URL before touching DNS.

## 3. Custom domain (one time)

```bash
# verify domain ownership (opens Search Console flow; add the TXT record it gives you in Namecheap)
gcloud domains verify alchemist404.com

gcloud beta run domain-mappings create --service alchemist404 \
  --domain alchemist404.com --region $REGION
gcloud beta run domain-mappings create --service alchemist404 \
  --domain www.alchemist404.com --region $REGION

# show the DNS records to configure:
gcloud beta run domain-mappings describe --domain alchemist404.com --region $REGION
```

In Namecheap: Domain List -> alchemist404.com -> Advanced DNS, remove parking records, then add exactly what the describe command printed. Typically:

- Root `@`: 4 A records (216.239.32.21 / 216.239.34.21 / 216.239.36.21 / 216.239.38.21) and 4 AAAA records (2001:4860:4802:32::15 etc.), use the values gcloud prints
- `www`: CNAME to `ghs.googlehosted.com.`

Wait for DNS propagation (minutes to a few hours). The Google-managed certificate provisions automatically once DNS resolves; the domain mapping status shows `CertificateProvisioned` when done. Renewal is automatic, nothing to maintain.

If domain mapping is not available in the region: fallback per ADR-001 is a global external Application Load Balancer with a serverless NEG (adds ~$18/mo), only do this after confirming with the owner.

## 4. Redeploys

Any content change: edit -> step 1 -> `./deploy.sh`. DNS and domain mapping never need touching again.

## Rollback

```bash
gcloud run revisions list --service alchemist404 --region europe-west1
gcloud run services update-traffic alchemist404 --region europe-west1 \
  --to-revisions REVISION_NAME=100
```

## Cost expectations

Cloud Run free tier: 2M requests, 360k GiB-seconds/mo. An informational site stays inside it, expected bill ~$0, worst case a few cents. Artifact Registry storage: cents. Set a budget alert at $5/mo in Billing -> Budgets as a tripwire.

## Escalation / checks

- Site down: check `gcloud run services describe alchemist404 --region europe-west1` and Cloud Run logs in console
- Cert issues: re-check Namecheap records match the domain mapping's required records exactly
- 404 on refresh with future subpages: nginx must have `try_files $uri $uri/ /index.html;`
