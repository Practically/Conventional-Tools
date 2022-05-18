#
# Conventional Tools Docker Build
#
FROM node:16

#
# Set the current working directory
#
WORKDIR /app

#
# Copy up the dist package
#
COPY dist .

#
# Install the conventional tools package
#
RUN npm i -g $(find . -type f -name "conventional-tools-v*.tar.gz")

#
# Remove the dist packages we copyied up elyer
#
RUN rm -rf /app/*
