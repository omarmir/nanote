# syntax = docker/dockerfile:1

# Define the Node.js version to use
ARG NODE_VERSION=23.11.0

# Base image for Node.js
FROM node:${NODE_VERSION}-slim AS base

WORKDIR /src

# Install PNPM globally
#RUN corepack enable && corepack prepare pnpm@latest --activate
RUN npm install -g pnpm

# Build stage
FROM base AS build

# Copy package.json and pnpm-lock.yaml
COPY --link package.json pnpm-lock.yaml ./

# Copy application source code
COPY --link . .

# Install dependencies using PNPM
RUN pnpm install --frozen-lockfile

# Build the application
RUN pnpm build

# Final runtime stage
FROM node:${NODE_VERSION}-slim AS runtime

# Environment variables
ENV NODE_ENV=production

WORKDIR /src

RUN mkdir /src/notes

# Copy the built application
COPY --from=build /src/.output /src/.output

# Install curl
RUN apt update && apt install -y curl
#&& rm -rf /var/lib/apt/lists/*


# Expose the desired ports
# Node
EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]