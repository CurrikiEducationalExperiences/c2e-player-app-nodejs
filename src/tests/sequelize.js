require("dotenv").config();
const Sequelize = require('sequelize');

// connect to postgres
const sequelizeOptions = {
  dialect: process.env.DB_DIALECT,
  port: process.env.PSQL_PORT,
  host: process.env.DB_HOST,
  pool: {
    max: 5,
    min: 0,
    idle: 10000,
  },
  ...(true && {
    ssl: true,
  }),
};

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  sequelizeOptions,
);

sequelize
  .authenticate()
  .then(() => {
    console.log('Jest => db connection established.');
  })
  .catch((err) => {
    console.log('Jest => db connection failed.');
    console.log("error:", err)
  });

module.exports = sequelize;
