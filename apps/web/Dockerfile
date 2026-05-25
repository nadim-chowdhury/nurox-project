FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package.json and pnpm-workspace.yaml files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/shared-schemas/package.json ./packages/shared-schemas/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the monorepo
COPY . .

# Build the Web and its dependencies (shared-schemas)
RUN pnpm turbo run build --filter=web

FROM node:20-alpine AS runner

WORKDIR /app

# Install curl for healthcheck
RUN apk add --no-cache curl

# Set NODE_ENV
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Ensure non-root user
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

# Copy necessary files from builder
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs

# Expose port
EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Healthcheck (Next.js doesn't have a default /health, we assume one or just check root)
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start the server (standalone output)
CMD ["node", "apps/web/server.js"]
