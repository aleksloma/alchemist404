#!/usr/bin/env bash
# Deploy the Alchemist 404 site to GCP Cloud Run.
# Single deployment path per docs/CONSTITUTION.md Article 7 and docs/DEPLOYMENT.md.
#
# Prerequisites (one-time, already done):
#   gcloud auth login                      # browser sign-in as aleksloma@gmail.com
#   gcloud config set project alchemist404
#   gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com
#
# Cloud Build builds the Dockerfile from source; no local Docker needed.
set -euo pipefail

cd "$(dirname "$0")"

REGION=europe-west1
SERVICE=alchemist404

echo "==> Local verification build"
npm run build

echo "==> Deploy to Cloud Run (Cloud Build from source)"
gcloud run deploy "$SERVICE" \
  --source . \
  --region "$REGION" \
  --allow-unauthenticated \
  --min-instances 0 --max-instances 2 \
  --memory 256Mi --cpu 1 --port 8080

echo "==> Done. Verify the service URL printed above."
