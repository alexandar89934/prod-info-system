#!/bin/sh
echo 'Running pre-check for nginx'

until $(curl --output /dev/null --silent --head --fail --write-out '%{http_code}' "http://backend:3000/healthcheck" | grep -q "200"); do
    echo 'Checking backend health...'
    sleep 1
done

echo 'Backend service is live. Running nginx...'

exec nginx -g 'daemon off;'
