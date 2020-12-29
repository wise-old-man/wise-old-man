# setup react production build
FROM node:14.15.3-alpine3.12 as builder

WORKDIR /wise-old-man/app

COPY package*.json ./
RUN npm install -s
COPY . .

ARG REACT_APP_ANALYTICS_TRACKING_ID

RUN npm run build