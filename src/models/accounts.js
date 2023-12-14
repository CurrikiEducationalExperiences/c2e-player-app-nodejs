const { DataTypes } = require("sequelize");
const { sequelize } = require("../utils/database");
const Accounts = sequelize.define("accounts", {
  id: {
    autoIncrement: true,
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "users",
      key: "id",
    },
  },
  facebook: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  instagram: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  twitter: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
});
module.exports = { Accounts };