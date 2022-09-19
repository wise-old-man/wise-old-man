import env, { getThreadIndex } from './env';
import api from './api';

const port = env.API_PORT || 5001;

api.express.listen(port, () => {
  console.log(`v2: Server running on port ${port}. Thread Index: ${getThreadIndex()}`);
});

process.on('SIGTERM', api.shutdown);
process.on('SIGINT', api.shutdown);
process.on('exit', api.shutdown);
