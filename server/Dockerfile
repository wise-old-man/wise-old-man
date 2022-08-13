FROM node:16.16.0

WORKDIR /wise-old-man/server

COPY package*.json ./
RUN npm install -s
RUN npm install pm2 -g

COPY . .

RUN npm run build

CMD ["npm", "run", "prod"]