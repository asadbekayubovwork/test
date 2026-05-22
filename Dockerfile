# syntax=docker/dockerfile:1
# Статический SPA (Vite): сборка в Node, раздача через nginx.
# Переменные VITE_* подставляются на этапе сборки — задайте их через --build-arg или docker compose (см. README).

FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_API_BASE_URL=https://api-wordzen.stnapps.com
ARG VITE_ACCOUNT_API_BASE_URL=https://account-wordzen.stnapps.com
ARG VITE_PAYMENT_API_BASE_URL=https://payment-wordzen.stnapps.com
ARG VITE_MINIAPP_CLIENT_KEY=""
ARG VITE_MEDIA_BASE_URL=https://media.stnapps.com
ARG VITE_MEDIA_PROXY_PREFIX=/media

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_ACCOUNT_API_BASE_URL=$VITE_ACCOUNT_API_BASE_URL
ENV VITE_PAYMENT_API_BASE_URL=$VITE_PAYMENT_API_BASE_URL
ENV VITE_MINIAPP_CLIENT_KEY=$VITE_MINIAPP_CLIENT_KEY
ENV VITE_MEDIA_BASE_URL=$VITE_MEDIA_BASE_URL
ENV VITE_MEDIA_PROXY_PREFIX=$VITE_MEDIA_PROXY_PREFIX

RUN npm run build

FROM nginx:1.27-alpine
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
