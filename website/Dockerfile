FROM node:alpine
WORKDIR /wise-old-man/website

COPY package*.json ./
RUN npm install -s

COPY . .

RUN npm run build

CMD ["npm", "start"]