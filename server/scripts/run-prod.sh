# Migrate the production database.
# This will check for, and apply any missing migrations
# prisma migrate deploy

# Run pm2 (on 4 CPU cores) on dist/src/server.ts and keep the process alive, restarting if it crashes
export NODE_ENV=production
pm2-runtime dist/src/server.js -i 4
