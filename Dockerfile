FROM node:lts-alpine3.16
LABEL maintainer="Hien Dao The Nguyen"
LABEL description="Fragments API microservice"
ENV PORT=8080
ENV NPM_CONFIG_LOGLEVEL=warn
ENV NPM_CONFIG_COLOR=false
WORKDIR /app
COPY ./tests/.htpasswd ./tests/.htpasswd
COPY package.json package-lock.json ./
RUN npm install
COPY ./src ./src
CMD npm start
EXPOSE 8080