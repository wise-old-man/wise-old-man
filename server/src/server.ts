require('dotenv').config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' });

import api from './api';

api.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});
