FROM node:12

WORKDIR /wise-old-man/server

COPY package*.json ./
RUN npm install -s

COPY . .
COPY wait-for-it.sh .

CMD ["npm", "start"]