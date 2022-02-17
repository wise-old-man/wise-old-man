# Start the API docker container
docker-compose up -d --no-deps --build api

# Apply any missing migrations
# NOTE REMOVE THIS DB HOST IN PRODUCTION, AS IT SHOULD BE POINTING TO REMOTE DB IN .env
DB_HOST=localhost npx prisma migrate deploy
