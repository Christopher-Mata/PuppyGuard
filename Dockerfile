FROM node:lts-alpine

WORKDIR /home/node/app
COPY package-lock.json package.json ./
ENV NODE_ENV=production
RUN npm ci

COPY build ./build/
COPY .env ./
ENTRYPOINT [ "node", "./build/app.js" ]
