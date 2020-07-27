import { sequelize } from '../src/database';

function resetDatabase() {
  return Promise.all(
    Object.values(sequelize.models).map(model => {
      return model.destroy({ truncate: true, force: true });
    })
  );
}

export { resetDatabase };
