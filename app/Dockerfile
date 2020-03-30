FROM node:alpine as app

WORKDIR /wise-old-man/app

COPY package*.json ./
RUN npm install -s

COPY . .

RUN npm run build

FROM nginx:1.16.0-alpine
COPY --from=app /wise-old-man/app/build /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx/nginx.conf /etc/nginx/conf.d

EXPOSE 80
CMD [ "nginx", "-g", "daemon off;"]