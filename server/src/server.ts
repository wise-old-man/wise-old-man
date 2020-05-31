require('dotenv').config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' });

const api = require('./api');

api.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});
