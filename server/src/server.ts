import env, { getThreadIndex } from './env';
import api from './api';

const port = env.API_PORT || 5001;

api.listen(port, () => {
  console.log(`v2: Server running on port ${port}. Thread Index: ${getThreadIndex()}`);
});
