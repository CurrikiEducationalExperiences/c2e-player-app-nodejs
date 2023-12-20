const ERROR_CODES = require("../constant/error-messages");
const CustomError = require("../utils/error");
//const sequelize = require('../utils/database');
const { Accounts } = require("../../models/accounts");

class AccountsService {
  static async post(params) {
    const user = await Accounts.create(params);
    return user;
  }

  static async get(params) {
    const users = await Accounts.findAll({
      offset: params.limit * (params.page - 1),
      limit: params.limit,
      raw: true,
    });
    return users;
  }
  static async patch(params) {
    let a = 10;
    if (a === 5) {
      throw new CustomError(ERROR_CODES.SAMPLE_ERROR);
    }
    return params;
  }
  static async delete(params) {
    let a = 10;
    if (a === 5) {
      throw new CustomError(ERROR_CODES.SAMPLE_ERROR);
    }
    return params;
  }
}
module.exports = { AccountsService };
