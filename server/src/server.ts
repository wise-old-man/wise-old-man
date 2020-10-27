import api from './api';
import env from './env';

const port = env.PORT || 5000;

// Test API deployment trigger 2

api.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
