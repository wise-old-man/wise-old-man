# setup react production build
FROM node:alpine as builder
WORKDIR /wise-old-man/app
COPY . /wise-old-man/app

ARG REACT_APP_ANALYTICS_TRACKING_ID

RUN npm install
RUN npm run build

#setup nginx
FROM nginx:alpine
COPY /nginx.conf /etc/nginx/conf.d/
COPY --from=builder /wise-old-man/app/build /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD [ "nginx", "-g", "daemon off;" ]