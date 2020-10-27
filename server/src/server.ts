import api from './api';
import env from './env';

const port = env.PORT || 5000;

// Test API deployment trigger 4

api.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
