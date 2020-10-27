import env from './env';
import api from './api';

const port = env.PORT || 5000;

// Test API deployment trigger

api.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
