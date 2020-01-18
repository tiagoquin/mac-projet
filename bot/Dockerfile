FROM node:latest

RUN mkdir -p /usr/src/bot
COPY ./node-bot/package.json /usr/src/bot
WORKDIR /usr/src/bot
RUN npm install
COPY ./wait-for-it.sh /usr/scripts/
COPY ./node-bot /usr/src/bot


