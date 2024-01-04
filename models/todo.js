const { DataTypes } = require("sequelize");
const { sequelize } = require("../src/utils/database");
const Todo = sequelize.define("todo", {
  id: {
    autoIncrement: true,
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
});
module.exports = { Todo };