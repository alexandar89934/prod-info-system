#!/bin/sh

yarn install

yarn global add pm2
npm install -g nodemon

echo "Waiting for the database to be ready..."
while ! nc -z postgres 5432; do
  sleep 1
done

echo "Running migrations..."
yarn migrate

echo "Seeding database..."
yarn seed

echo "Starting the application..."
pm2-runtime start ecosystem.config.js
