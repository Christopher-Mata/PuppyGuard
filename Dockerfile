FROM node:lts-alpine

WORKDIR /home/node/app
COPY package-lock.json package.json ./
RUN NODE_ENV=production npm ci

ENV NODE_ENV='development' TOKEN='' CLIENT_ID='' MONGO_URL='mongodb://127.0.0.1:27017/' DB_NAME='puppyguard'

COPY build ./build/
ENTRYPOINT [ "node", "./build/app.js" ]
