# Stage 1: Build the React frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY client/package*.json ./client/
RUN cd client && npm ci
COPY client/ ./client/
RUN cd client && npm run build

# Stage 2: Build the Bun backend and serve static files
FROM oven/bun:1 AS runner
WORKDIR /app

RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

COPY server/package.json server/bun.lock* ./
RUN bun install --no-save --production

COPY server/ ./server/
COPY --from=frontend-builder /app/client/dist ./client/dist

RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

ENV PORT=3000
ENV NODE_ENV=production

WORKDIR /app/server
CMD ["bun", "run", "src/index.ts"]
