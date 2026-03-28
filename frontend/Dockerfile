# ============================================================
# SCM Platform Frontend — Multi-stage Dockerfile
# Stage 1: Node build
# Stage 2: Nginx production server
# ============================================================

# Stage 1 — Build
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies first (cached layer)
COPY package.json package-lock.json* ./
RUN npm ci --silent

# Copy source and build
COPY . .
RUN npm run build

# Stage 2 — Production Nginx
FROM nginx:1.27-alpine AS runtime

# Security: remove default nginx user and run as non-root
RUN addgroup -S scm && adduser -S scm -G scm

# Copy built assets from build stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Custom nginx config for React SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -q --spider http://localhost:80/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
