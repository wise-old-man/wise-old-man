FROM node:alpine

WORKDIR /wise-old-man

COPY package*.json ./
RUN npm install

COPY . .

CMD ["npm", "start"]