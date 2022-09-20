import env, { getThreadIndex } from './env';
import api from './api';

const port = env.API_PORT || 5001;

const server = api.express.listen(port, () => {
  console.log(`v2: Server running on port ${port}. Thread Index: ${getThreadIndex()}`);
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
