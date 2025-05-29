# Migrate the production database.
# This will check for, and apply any missing migrations
prisma migrate deploy

# Run pm2 (on 4 CPU cores) on dist/src/server.ts and keep the process alive, restarting if it crashes
export NODE_ENV=production
# pm2-runtime dist/src/server.js -i 1 --node-args="--inspect=0.0.0.0:9229"
node --inspect=0.0.0.0:9229 dist/src/server.js
