###################
# BUILD FOR LOCAL DEVELOPMENT
###################

FROM node:18 AS development

WORKDIR /usr/src/front

COPY --chown=node:node package.json ./

RUN npm install

# Install global dependencies for vite and vue 
RUN npm install -g vite 
RUN npm install -g @vue/cli

USER node

###################
# BUILD FOR PRODUCTION
###################

FROM node:18 AS build

WORKDIR /usr/src/front

COPY --chown=node:node package.json ./
COPY --chown=node:node --from=development /usr/src/front/node_modules ./node_modules
COPY --chown=node:node . .

# Aumentar la memoria disponible para Node.js
ENV NODE_OPTIONS=--max_old_space_size=4096

RUN npm run build

USER node

###################
# PRODUCTION
###################

FROM node:18-alpine AS production

RUN npm install -g http-server

WORKDIR /usr/src/front

COPY --chown=node:node --from=build /usr/src/front/dist ./dist

USER node

CMD ["http-server", "dist"]