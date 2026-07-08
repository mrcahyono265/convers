# Stage 1: Build the React frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY client/package*.json ./client/
RUN cd client && npm ci
COPY client/ ./client/
RUN cd client && npm run build

# Stage 2: Bun backend
FROM oven/bun:1 AS runner
WORKDIR /app

# Install dependencies first (layer caching)
COPY server/package.json server/bun.lock* /app/
RUN bun install --frozen-lockfile --no-save --production

# Copy source code and built frontend
COPY server/ ./server/
COPY --from=frontend-builder /app/client/dist ./client/dist

RUN chown -R 65534:65534 /app
USER 65534

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD bun -e "fetch('http://localhost:3000/health').then(r => process.exit(r.ok?0:1)).catch(() => process.exit(1))"

ENV PORT=3000
ENV NODE_ENV=production

WORKDIR /app/server
CMD ["bun", "run", "src/index.ts"]
