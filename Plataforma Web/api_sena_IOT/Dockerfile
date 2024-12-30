###################
# BASE IMAGE
###################
FROM node:18 AS base

# Instalar las dependencias necesarias para Puppeteer
RUN apt-get update && apt-get install -y --no-install-recommends \
    gconf-service libgbm-dev libasound2 libatk1.0-0 libc6 libcairo2 libcups2 \
    libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 \
    libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 \
    libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 \
    libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates \
    fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

###################
# DEVELOPMENT
###################
FROM base AS development

# Copy application dependency manifests to the container image.
COPY --chown=node:node package.json ./

# Install app dependencies
RUN npm install

# Bundle app source
COPY --chown=node:node . .

# Use the node user from the image (instead of the root user)
USER node

###################
# BUILD
###################
FROM base AS build

WORKDIR /usr/src/app

COPY --chown=node:node package.json ./

# Copy node_modules from development stage
COPY --chown=node:node --from=development /usr/src/app/node_modules ./node_modules

COPY --chown=node:node . .

# Run the build command which creates the production bundle
RUN npm run build

# Use the node user from the image (instead of the root user)
USER node

###################
# PRODUCTION
###################
FROM base AS production

WORKDIR /usr/src/app

# Set NODE_ENV environment variable
ENV NODE_ENV=production

# Copy the bundled code from the build stage to the production image
COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/dist ./dist
COPY --chown=node:node --from=build /usr/src/app/.env ./

# COPY FOLDER PUBLIC
COPY --chown=node:node --from=build /usr/src/app/public ./public

# Clean npm cache
RUN npm cache clean --force

# Start the server using the production build
CMD ["node", "dist/index.js"]