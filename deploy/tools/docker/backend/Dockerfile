FROM node:20-alpine

WORKDIR /backend

COPY deploy/backend/package*.json ./
COPY deploy/backend/yarn.lock ./

RUN yarn install

RUN yarn global add pm2
RUN npm install -g nodemon

COPY deploy/backend/ ./

COPY deploy/tools/docker/backend/entrypoint.sh ./
RUN chmod +x ./entrypoint.sh

EXPOSE 3000
