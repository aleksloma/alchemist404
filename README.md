# Alchemist 404 Website

Informational single-page website for Alchemist 404, an experimental roguelike deckbuilder inspired by real-world chemistry. Static site (Vite + vanilla HTML/CSS/JS), served by nginx in a container on GCP Cloud Run at [alchemist404.com](https://alchemist404.com).

## Prerequisites

- Node.js 22+ (LTS)
- Docker (optional, for production-parity testing)
- gcloud CLI (only for deploying, see docs/DEPLOYMENT.md)

## Run locally

```bash
cd site
npm install
npm run assets   # one-time: process raw art from the repo root into src/assets/
npm run dev      # http://localhost:5173
```

## Build and test

```bash
npm run build    # production build into site/dist/
npm run preview  # serve the build locally
docker build -t alchemist404 . && docker run --rm -p 8080:8080 alchemist404
```

## Deploy

`site/deploy.sh` deploys to Cloud Run. Full runbook, DNS setup, and the git workflow: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Documentation

Project rules and reference live in [docs/](docs/): CONSTITUTION (non-negotiable rules), ARCHITECTURE, DESIGN, CONTENT, DEPLOYMENT. Read CONSTITUTION.md first.
