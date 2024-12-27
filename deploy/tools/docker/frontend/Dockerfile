FROM node:20-alpine

WORKDIR /frontend

COPY deploy/frontend/package*.json ./
COPY deploy/frontend/yarn.lock ./

ENV NODE_ENV=development

RUN yarn install

COPY deploy/frontend/ ./

COPY deploy/tools/docker/frontend/entrypoint.sh ./
RUN chmod +x ./entrypoint.sh

EXPOSE 5173

CMD [ "yarn", "dev" ]