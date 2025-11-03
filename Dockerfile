FROM node:20-alpine

WORKDIR /usr/src/app

# deps for sharp
RUN apk add --no-cache libc6-compat build-base python3 vips-dev

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 3333
