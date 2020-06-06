import { SKILLS, BOSSES, ACTIVITIES, getRankKey, getValueKey } from '../../api/constants/metrics';
import { EntitySchema } from 'typeorm';

function buildDynamicSchema() {
  const obj = {};

  SKILLS.forEach(s => {
    obj[getRankKey(s)] = {
      type: Number,
      default: -1,
      nullable: false
    };
    obj[getValueKey(s)] = {
      type: s === 'overall' ? 'bigint' : Number,
      default: -1,
      nullable: false,
      get() {
        // As experience (overall) can exceed the integer maximum of 2.147b,
        // we have to store it into a BIGINT, however, sequelize returns bigints
        // as strings, to counter that, we convert every bigint to a JS number
        return parseInt(this.getDataValue(getValueKey(s)), 10);
      }
    };
  });

  ACTIVITIES.forEach(s => {
    obj[getRankKey(s)] = {
      type: Number,
      default: -1,
      nullable: false
    };
    obj[getValueKey(s)] = {
      type: Number,
      default: -1,
      nullable: false
    };
  });

  BOSSES.forEach(s => {
    obj[getRankKey(s)] = {
      type: Number,
      default: -1,
      nullable: false
    };
    obj[getValueKey(s)] = {
      type: Number,
      default: -1,
      nullable: false
    };
  });

  return obj;
}

export const InitialValues = new EntitySchema({
  name: 'initialValues',
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: "increment"
    },
    playerId: {
      type: Number,
      nullable: false
    },
    importedAt: {
      type: Date
    },
    ...buildDynamicSchema()
  }
})

// export default (sequelize, DataTypes) => {
//   const schema = {
//     id: {
//       type: Number,
//       primaryKey: true,
//       autoIncrement: true
//     },
//     playerId: {
//       type: Number,
//       nullable: false
//     },
//     ...buildDynamicSchema(DataTypes)
//   };

//   // Define other table options
//   const options = {
//     createdAt: false,
//     indexes: [
//       {
//         unique: true,
//         fields: ['id']
//       },
//       {
//         fields: ['playerId']
//       }
//     ]
//   };

//   // Create the model
//   const InitialValues = sequelize.define('initialValues', schema, options);

//   // Define all model associations
//   InitialValues.associate = models => {
//     InitialValues.belongsTo(models.Player, {
//       foreignKey: 'playerId',
//       onDelete: 'CASCADE'
//     });
//   };

//   return InitialValues;
// };
