#
# Conventional Tools Docker Build
#

#
# Install all the dependencies in its own step for better step cacheing
#
FROM node:20 as deps

WORKDIR /build
COPY package.json /build/package.json
COPY yarn.lock /build/yarn.lock

RUN yarn install

#
# Build the conventional tools package
#
FROM node:20 as build

WORKDIR /build

COPY --from=deps /build/node_modules /build/node_modules

COPY .git /build/.git
COPY bin /build/bin
COPY package.json /build/package.json
COPY src /build/src
COPY tsconfig.json /build/tsconfig.json
COPY yarn.lock /build/yarn.lock

RUN yarn build
RUN npm pack

#
# Step for the main step
#
FROM node:20 as app

WORKDIR /app

#
# Copy up the dist package
#
COPY --from=build /build/dist .

#
# Install the conventional tools package
#
RUN npm i -g $(find . -type f -name "conventional-tools-v*.tar.gz")

#
# Remove the dist packages we copied up earlier
#
RUN rm -rf /app/*
