# WARNING:
#
# For development and debugging only. Use Dockerfile.release for production.
#
# This self-use development image runs Flood without bundling rTorrent.
#
# This Dockerfile uses contents of current folder which might contain
# secrets, uncommitted changes or other sensitive information. DO NOT
# publish the result image unless it was composed in a clean environment.

ARG BUILDPLATFORM=amd64
ARG NODE_IMAGE=docker.io/node:24.22.2-alpine

FROM --platform=$BUILDPLATFORM ${NODE_IMAGE} AS nodebuild

WORKDIR /usr/src/app/

# Copy project files
COPY . ./

RUN npm i -g corepack && corepack enable && corepack install

# Fetch dependencies from npm
RUN pnpm install --frozen-lockfile

# Build assets
RUN npm run build

# Now get the clean Node.js image
FROM ${NODE_IMAGE} AS flood

WORKDIR /usr/src/app/

# Copy sources
COPY --from=nodebuild /usr/src/app ./

# Install runtime dependencies
RUN apk --no-cache add \
    mediainfo

# Create "download" user
RUN adduser -h /home/download -s /sbin/nologin --disabled-password download

# Run as "download" user
USER download

# Expose port 3000 and 4200
EXPOSE 3000
EXPOSE 4200

# Flood server in development mode
ENTRYPOINT ["npm", "--prefix=/usr/src/app/", "run", "start", "--", "--host=::"]

# To start the frontend development server:
# docker exec -it ${container_id} npm --prefix=/usr/src/app/ run start:development:client
