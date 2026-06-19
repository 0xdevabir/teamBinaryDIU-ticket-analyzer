# syntax=docker/dockerfile:1
# =============================================================================
# Ticket Analyzer — Frontend (React + Vite)
# Cross-platform: linux/amd64 + linux/arm64 (official node/nginx images are multi-arch)
# Targets: development | build | production
# =============================================================================

# ── Development ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS development

WORKDIR /app

ENV npm_config_update_notifier=false

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]

# ── Build ────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

ARG VITE_API_BASE_URL=/api/v1
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV npm_config_update_notifier=false

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
RUN npm run build

# ── Production (nginx) ───────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS production

RUN rm -f /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1:80/ > /dev/null 2>&1 || exit 1

CMD ["nginx", "-g", "daemon off;"]
