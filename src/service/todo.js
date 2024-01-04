//const bcrypt = require("bcrypt");
//const passCom = require("joi-password-complexity");
const ERROR_CODES = require("../constant/error-messages");
const CustomError = require("../utils/error");
const { Todo } = require("../../models/todo");
//const { ResetPasswordTokens } = require("../../models/resetPasswordTokens");
//const { emailService } = require("../utils/email");

// const {
//   issueToken,
// //  issueResetPassToken,
//   validatePasswordToken,
// } = require("../middleware/auth");
// const _complexityOptions = {
//   min: 8,
//   max: 26,
//   lowerCase: 1,
//   upperCase: 1,
//   numeric: 1,
//   symbol: 1,
// };

class TodoService {
  static async create(params) {
    const _existingProfile = await Todo.findOne({
      where: { name: params.name },
      raw: true,
    });
    if (_existingProfile) {
      throw new CustomError(ERROR_CODES.TODO_ALREADY_EXISTS);
    }
    
    await Todo.create({
      name: params.name,
      status: params.status,
    });
    return true;
  }

  static async get() {
    const _profile = await Todo.findAll({
      raw: true,
    });
    if (!_profile) {
      throw new CustomError(ERROR_CODES.INVALID_EMAIL_PASSWORD);
    }
    return _profile;
  }

  static async update(params) {
    const _user = await Admin.findOne({
      where: { id: params.id },
      attributes: { exclude: ["password"] },
      raw: true,
    });
    return _user;
  }

  static async delete(params) {
    const _decodedToken = validatePasswordToken(params.token);
    if (!_decodedToken) throw new CustomError(ERROR_CODES.TOKEN_FAILED);
    if (_decodedToken === 404) throw new CustomError(ERROR_CODES.TOKEN_FAILED);
    const _tokenCheck = await ResetPasswordTokens.findOne({
      where: { token: params.token },
      raw: true,
    });
    if (!_tokenCheck) {
      throw new CustomError(ERROR_CODES.TOKEN_FAILED);
    }
    return true;
  }

}
module.exports = { TodoService };
