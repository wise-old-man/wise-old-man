# Setup the docker dependencies (Postgres, PGAdmin and Redis)
docker-compose up --build -d

# Reset the test database.
export CORE_DATABASE=wise-old-man-test
prisma migrate reset --force

# Run jest on all unit tests
jest __tests__/unit --detectOpenHandles --verbose --force-exit 

status=$?

if [ $status -eq 0 ];
then
    # Run jest on all integration tests
    export NODE_ENV=test
    export TZ=UTC
    jest __tests__/integration --detectOpenHandles --verbose --force-exit
else
    echo "$(tput setaf 1)Unit tests failed - Skipping Integration tests"
fi