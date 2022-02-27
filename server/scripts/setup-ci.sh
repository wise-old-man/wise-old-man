# Start all the docker containers
docker-compose -f docker-compose.ci.yml up --build -d

# Reset the database
export DB_HOST=localhost
npx dotenv -e .env.test -- npx prisma migrate reset --force

# Run the tests
npm run test