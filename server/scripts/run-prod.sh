#!/bin/bash
set -e

if [ -z "$SERVER_TYPE" ]; then
  echo "ERROR: SERVER_TYPE is not set (must be 'api', 'job-runner' or 'bull-board')"
  exit 1
fi

if [ -z "$PM2_INSTANCES" ]; then
  echo "ERROR: PM2_INSTANCES is not set (must be a positive integer)"
  exit 1
fi

# Pick the correct entrypoint based on SERVER_TYPE
if [ "$SERVER_TYPE" = "api" ]; then
  ENTRYPOINT="dist/src/entrypoints/api.server.js"
elif [ "$SERVER_TYPE" = "job-runner" ]; then
  ENTRYPOINT="dist/src/entrypoints/job-runner.server.js"
elif [ "$SERVER_TYPE" = "bull-board" ]; then
  ENTRYPOINT="dist/src/entrypoints/bull-board.server.js"
else
  echo "ERROR: Unknown SERVER_TYPE: $SERVER_TYPE"
  exit 1
fi

echo "Starting server | SERVER_TYPE=$SERVER_TYPE | PM2_INSTANCES=$PM2_INSTANCES"

# Start the server with PM2 using the specified number of instances
export NODE_ENV=production
pm2-runtime "$ENTRYPOINT" -i "$PM2_INSTANCES"
