# setup react production build
FROM node:13-alpine as builder

WORKDIR /wise-old-man/app

COPY package*.json ./
RUN npm install -s
COPY . .

ARG REACT_APP_ANALYTICS_TRACKING_ID

RUN npm run build