# Setup the docker dependencies (Postgres, PGAdmin and Redis)
docker-compose up --build -d

# Reset the test database.
export CORE_DATABASE=wise-old-man-test
prisma migrate reset --force

# Run jest on all integration tests
export NODE_ENV=test
export TZ=UTC
jest __tests__/integration --detectOpenHandles --verbose --force-exit 