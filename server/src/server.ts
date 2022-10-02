import env, { getThreadIndex } from './env';
import logger from './api/util/logging';
import api from './api';

const port = env.API_PORT || 5001;

const server = api.express.listen(port, () => {
  logger.info(
    `v${env.npm_package_version}: Server running on port ${port}. Thread Index: ${getThreadIndex()}`
  );
});

process.on('SIGTERM', () => {
  server.close();
  api.shutdown();
});

process.on('SIGINT', () => {
  server.close();
  api.shutdown();
});

process.on('exit', () => {
  server.close();
  api.shutdown();
});
