#!/usr/bin/env bash
# Deploy the Alchemist 404 site to GCP Cloud Run.
# Single deployment path per docs/CONSTITUTION.md Article 7 and docs/DEPLOYMENT.md.
# Prerequisites: gcloud CLI logged in, Docker running, one-time GCP setup done
# (project alchemist404-site, Artifact Registry repo "web" in europe-west1).
set -euo pipefail

cd "$(dirname "$0")"

REGION=europe-west1
PROJECT=alchemist404-site
TAG=$(git rev-parse --short HEAD 2>/dev/null || date +%Y%m%d%H%M%S)
IMG=$REGION-docker.pkg.dev/$PROJECT/web/alchemist404:$TAG

echo "==> Local verification build"
npm run build

echo "==> Docker build: $IMG"
docker build -t "$IMG" .

echo "==> Push to Artifact Registry"
gcloud auth configure-docker "$REGION-docker.pkg.dev" --quiet
docker push "$IMG"

echo "==> Deploy to Cloud Run"
gcloud run deploy alchemist404 \
  --image "$IMG" --region "$REGION" \
  --allow-unauthenticated \
  --min-instances 0 --max-instances 2 \
  --memory 256Mi --cpu 1 --port 8080

echo "==> Done. Verify the *.run.app URL printed above before touching DNS."
