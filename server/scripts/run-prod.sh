# Migrate the production database.
# This will check for, and apply any missing migrations
# prisma migrate deploy DON'T DO THIS FOR NOW

# Run pm2 (on 4 CPU cores) on dist/server.ts and keep the process alive, restarting if it crashes
export NODE_ENV=production
pm2-runtime dist/server.js -i 4