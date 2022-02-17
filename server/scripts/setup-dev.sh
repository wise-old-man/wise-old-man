# Start all the docker containers
docker-compose up --build -d

# Apply any missing (dev) migrations
DB_HOST=localhost npx prisma migrate dev

# Follow the API container's logs
docker logs -f api