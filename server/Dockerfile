FROM node:alpine
RUN apk update && apk add bash

WORKDIR /wise-old-man

COPY package*.json ./
RUN npm install

COPY . .

COPY wait-for-it.sh .

CMD ["npm", "start"]