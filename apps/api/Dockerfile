FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package.json and pnpm-workspace.yaml files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY packages/shared-schemas/package.json ./packages/shared-schemas/
COPY packages/ui/package.json ./packages/ui/
COPY packages/ui-tokens/package.json ./packages/ui-tokens/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/typescript-config/package.json ./packages/typescript-config/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the monorepo
COPY . .

# Build shared-schemas first (produces dist/), then the API
RUN pnpm turbo run build --filter=@repo/shared-schemas && \
    pnpm turbo run build --filter=api

FROM node:20-alpine AS runner

WORKDIR /app

# Install pnpm and curl for healthcheck
RUN npm install -g pnpm && apk add --no-cache curl

# Set NODE_ENV
ENV NODE_ENV production

# Create non-root user
RUN addgroup -S nodejs && adduser -S nestjs -G nodejs

# Copy workspace config files needed for pnpm install
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nestjs:nodejs /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder --chown=nestjs:nodejs /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder --chown=nestjs:nodejs /app/packages/shared-schemas/package.json ./packages/shared-schemas/package.json

# Install production dependencies with hoisted node_modules (flat structure, no symlinks)
RUN pnpm install --prod --frozen-lockfile --ignore-scripts --config.node-linker=hoisted

# Copy compiled API dist
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/dist ./apps/api/dist

# Copy compiled shared-schemas dist and patch exports for production
COPY --from=builder --chown=nestjs:nodejs /app/packages/shared-schemas/dist ./packages/shared-schemas/dist
RUN echo '{"name":"@repo/shared-schemas","version":"0.0.1","private":true,"main":"./dist/index.js","types":"./dist/index.d.ts","exports":{".":"./dist/index.js","./*":"./dist/*"}}' > ./packages/shared-schemas/package.json

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3001

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:3001/api/health || exit 1

# Start the server
CMD ["node", "apps/api/dist/main.js"]
