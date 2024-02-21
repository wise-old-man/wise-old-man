import { getThreadIndex } from './env';
import logger from './api/util/logging';
import api from './api';

const port = process.env.API_PORT;

const server = api.express.listen(port, () => {
  const version = process.env.npm_package_version;
  logger.info(`v${version}: Server running on port ${port}. Thread Index: ${getThreadIndex()}`);
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
