# syntax=docker/dockerfile:1

ARG NODE_VERSION=23.11.0

# Base image for development and build
FROM node:${NODE_VERSION}-slim AS base

WORKDIR /src

# Install pnpm globally
RUN npm install -g pnpm

# Install dependencies and build app
FROM base AS build

# Copy only lockfile and manifest first to leverage cache
COPY package.json pnpm-lock.yaml .npmrc ./

# Install dependencies (no dev dependencies in production build)
RUN pnpm install --frozen-lockfile

# Copy source files
COPY . .

# Build the application
RUN pnpm build

# Production runtime image
FROM node:${NODE_VERSION}-slim AS runtime

ENV NODE_ENV=production
WORKDIR /src

# Required for Puppeteer (headless Chrome)
RUN apt-get update && \
  apt-get install -y --no-install-recommends \
  curl \
  chromium \
  libasound2 \
  libatk1.0-0 \
  libatk-bridge2.0-0 \
  libcairo2 \
  libcups2 \
  libdbus-1-3 \
  libexpat1 \
  libfontconfig1 \
  libgbm1 \
  libgcc-s1 \
  libgconf-2-4 \
  libgdk-pixbuf2.0-0 \
  libglib2.0-0 \
  libgtk-3-0 \
  libnspr4 \
  libnss3 \
  libpango-1.0-0 \
  libpangocairo-1.0-0 \
  libstdc++6 \
  libx11-6 \
  libx11-xcb1 \
  libxcb1 \
  libxcomposite1 \
  libxcursor1 \
  libxdamage1 \
  libxext6 \
  libxfixes3 \
  libxi6 \
  libxrandr2 \
  libxrender1 \
  libxss1 \
  libxtst6 \
  ca-certificates \
  fonts-liberation \
  lsb-release \
  xdg-utils \
  ugrep \
  wget && \
  rm -rf /var/lib/apt/lists/*

# Copy only needed files from build
COPY --from=build /src/.output /src/.output
COPY --from=build /src/server/db/migrations /src/server/db/migrations

# Expose port
EXPOSE 3000

# Start the app
CMD ["node", ".output/server/index.mjs"]
