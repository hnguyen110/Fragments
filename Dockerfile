FROM node:lts-alpine3.16 AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --only=production
COPY ./src ./src
COPY ./tests ./tests

FROM node:lts-alpine3.16
WORKDIR /app
COPY --from=build /app ./
CMD ["npm", "start"]
EXPOSE 8080