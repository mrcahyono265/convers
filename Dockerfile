# Stage 1: Build the React frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app
# Copy client package.json and install dependencies
COPY client/package*.json ./client/
RUN cd client && npm install
# Copy client source code and build
COPY client/ ./client/
RUN cd client && npm run build

# Stage 2: Build the Bun backend and serve static files
FROM oven/bun:1 AS runner
WORKDIR /app

# Copy server package.json and install dependencies
COPY server/package.json ./server/
COPY server/bun.lock ./server/
RUN cd server && bun install --production

# Copy backend source code
COPY server/ ./server/

# Copy the built frontend from Stage 1
COPY --from=frontend-builder /app/client/dist ./client/dist

# Expose port 3000
EXPOSE 3000

# Set environment variables (will be overridden by docker-compose)
ENV PORT=3000
ENV NODE_ENV=production

# Command to run the application
WORKDIR /app/server
CMD ["bun", "run", "src/index.ts"]
