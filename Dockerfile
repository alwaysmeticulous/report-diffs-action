FROM node:lts-slim

WORKDIR /app

RUN apt-get update \
 && apt-get upgrade -y

COPY package.json yarn.lock ./

RUN yarn --frozen-lockfile

COPY tsconfig.base.json tsconfig.json ./

COPY src src

RUN yarn build

CMD ["/app/dist/index.mjs"]
