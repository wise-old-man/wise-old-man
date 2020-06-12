require('dotenv').config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' });

import { app } from './api';
import { sequelize } from './database';

async function start() {
  await sequelize.sync();

  app.listen(process.env.PORT || 5000, () => {
    console.log(`Server running on port ${process.env.PORT || 5000}`);
  });
};

start();
