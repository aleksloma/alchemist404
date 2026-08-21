# Multi-stage build: Vite build in Node, then nginx:alpine serving static files.
# Note: `npm run assets` is NOT run here; processed assets in src/assets/ are
# generated locally from the raw folders (which live outside this build context).

FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
