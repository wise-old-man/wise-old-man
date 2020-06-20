import * as dotenv from 'dotenv';
import { api } from './api';

dotenv.config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' });

api.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});
