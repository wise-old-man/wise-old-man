# Only setup docker for local runs (not in CI)
if [ $# -eq 0 ]; then
    # Setup the docker dependencies (Postgres, PGAdmin and Redis)
    docker-compose up --build -d
fi

# Reset the test database.
export CORE_DATABASE=wise-old-man-test
prisma migrate reset --force

# Run jest on all unit and integration tests tests
export NODE_ENV=test TZ=UTC
jest __tests__/suites --detectOpenHandles --verbose --forceExit