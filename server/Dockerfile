FROM node:18-bullseye

WORKDIR /wise-old-man/server

COPY package*.json ./
RUN npm install -s
RUN npm install pm2 -g

COPY . .

RUN npx prisma generate
RUN npm run build

CMD ["bash", "./scripts/run-prod.sh"]
