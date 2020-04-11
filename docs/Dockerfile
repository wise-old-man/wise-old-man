FROM node:alpine
WORKDIR /wise-old-man/docs

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

CMD ["npm", "start"]