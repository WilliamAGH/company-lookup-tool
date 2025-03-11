FROM oven/bun:1.1.13 AS builder

WORKDIR /app

# Copy package files
COPY package.json ./
COPY bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile --development

# Copy source files
COPY . .

# Define build arguments with defaults
ARG CI
ARG DOCKER_BUILD=true
ARG NODE_ENV
ARG BUN_PORT
ARG HOST
ARG ORIGIN
ARG PUBLIC_BUN_BASE_URL
ARG PUBLIC_BUN_API_URL
ARG PUBLIC_ENVIRONMENT

# Set build-time environment variables with values from ARGs or their defaults
ENV CI=${CI}
ENV DOCKER_BUILD=${DOCKER_BUILD}
ENV NODE_ENV=${NODE_ENV}
ENV BUN_PORT=${BUN_PORT}
ENV HOST=${HOST}
ENV ORIGIN=${ORIGIN}
ENV PUBLIC_BUN_BASE_URL=${PUBLIC_BUN_BASE_URL}
ENV PUBLIC_BUN_API_URL=${PUBLIC_BUN_API_URL}
ENV PUBLIC_ENVIRONMENT=${PUBLIC_ENVIRONMENT}

# Run sveltekit sync via vite to generate .svelte-kit directory
RUN bunx svelte-kit sync

# Build the application
RUN bun run build

# Install production dependencies in a separate directory to avoid dev dependencies
RUN mkdir -p /app/prod_node_modules && \
    cd /app/prod_node_modules && \
    cp /app/package.json /app/bun.lock . && \
    bun install --frozen-lockfile --production

# Production stage
FROM oven/bun:1.1.13-slim

WORKDIR /app

# Install curl and wget for healthchecks
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl wget ca-certificates && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy built assets from builder stage
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json .
COPY --from=builder /app/bun.lock .
COPY --from=builder /app/prod_node_modules/node_modules ./node_modules

# Define runtime arguments with defaults
ARG CI
ARG DOCKER_BUILD=true
ARG NODE_ENV
ARG BUN_PORT
ARG HOST
ARG ORIGIN
ARG PUBLIC_BUN_BASE_URL
ARG PUBLIC_BUN_API_URL
ARG PUBLIC_ENVIRONMENT

# Set runtime environment variables
ENV NODE_ENV=${NODE_ENV}
ENV HOST=${HOST}
ENV BUN_PORT=${BUN_PORT:-3000}
ENV PUBLIC_ENVIRONMENT=${PUBLIC_ENVIRONMENT}
ENV PUBLIC_BUN_BASE_URL=${PUBLIC_BUN_BASE_URL}
ENV PUBLIC_BUN_API_URL=${PUBLIC_BUN_API_URL}
ENV ORIGIN=${ORIGIN}

# Note: DATABASE_URL should be passed at runtime or through container secrets
# Do not hardcode the Supabase connection string in the Dockerfile

# Expose the port Bun runs on
EXPOSE ${BUN_PORT}

# Create a healthcheck
HEALTHCHECK --interval=180s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:${BUN_PORT}/api/health || exit 1

# Start the application
CMD ["bun", "run", "build/index.js"]