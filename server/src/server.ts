import api from './api';
import env from './env';

const port = env.PORT || 6000;

// Test API deployment trigger 4

api.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
