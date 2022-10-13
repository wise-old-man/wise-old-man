# Setup the docker dependencies (Postgres, PGAdmin and Redis)
docker-compose up --build -d

# Migrate the development database.
# This will remove any data from it and apply any missing migrations
prisma migrate dev

# Run ts-node-dev on src/server.ts and keep the process alive, restarting when the code changes
export NODE_ENV=development
ts-node-dev --poll --exit-child --respawn --transpile-only --ignore-watch node_modules src/server.ts