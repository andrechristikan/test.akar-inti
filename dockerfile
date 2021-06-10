FROM node:lts-alpine
LABEL maintainer "andrechristikan@gmail.com"

RUN apk add curl

WORKDIR /app

COPY package.json .
RUN set -x && yarn --prod

COPY . .

RUN yarn
RUN mv ./config-example.yml ./config.yml
RUN yarn prebuild && yarn build
RUN ls .

EXPOSE 3000

CMD [ "yarn", "run", "start:prod" ]
