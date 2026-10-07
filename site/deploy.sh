#!/usr/bin/env bash
# Deploy the Alchemist 404 site to GCP Cloud Run.
# Single deployment path per docs/CONSTITUTION.md Article 7 and docs/DEPLOYMENT.md.
#
# The script pins its own gcloud account and project through CLOUDSDK_CORE_ACCOUNT
# and CLOUDSDK_CORE_PROJECT (exported for this process only). It works no matter
# which account or project is active globally, and it never modifies the user's
# global gcloud account or project. No `gcloud config set project` is needed.
#
# Prerequisites (one-time, already done):
#   gcloud auth login aleksloma@gmail.com  # browser sign-in; repeat if the token expires
#   gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com --project alchemist404
#
# Cloud Build builds the Dockerfile from source; no local Docker needed.
set -euo pipefail

export CLOUDSDK_CORE_ACCOUNT=aleksloma@gmail.com
export CLOUDSDK_CORE_PROJECT=alchemist404

if ! gcloud auth list --format='value(account)' | grep -qx "$CLOUDSDK_CORE_ACCOUNT"; then
  echo "ERROR: $CLOUDSDK_CORE_ACCOUNT is not authenticated in gcloud." >&2
  echo "Run once:  gcloud auth login $CLOUDSDK_CORE_ACCOUNT" >&2
  exit 1
fi
echo "==> Deploying as $CLOUDSDK_CORE_ACCOUNT to project $CLOUDSDK_CORE_PROJECT"

cd "$(dirname "$0")"

REGION=europe-west1
SERVICE=alchemist404

echo "==> Local verification build"
npm run build

echo "==> Deploy to Cloud Run (Cloud Build from source)"
gcloud run deploy "$SERVICE" \
  --project "$CLOUDSDK_CORE_PROJECT" \
  --source . \
  --region "$REGION" \
  --allow-unauthenticated \
  --min-instances 0 --max-instances 2 \
  --memory 256Mi --cpu 1 --port 8080

echo "==> Done. Verify the service URL printed above."
