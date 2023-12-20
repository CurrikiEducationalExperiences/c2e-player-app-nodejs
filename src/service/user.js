const ERROR_CODES = require("../constant/error-messages");
const CustomError = require("../utils/error");
const { User } = require("../../models/users");
const { Accounts } = require("../../models/accounts");
const bcrypt = require("bcrypt");
const { issueToken } = require("../middleware/auth");
class UserService {
  static async register(params) {
    const existingProfile = await User.findOne({
      where: { email: params.email },
      raw: true,
    });
    if (existingProfile) {
      throw new CustomError(ERROR_CODES.USER_ALREADY_EXISTS);
    }
    await User.create({
      name: params.name,
      email: params.email,
      phone: params.phone,
      password: bcrypt.hashSync(params.password, bcrypt.genSaltSync(2)),
    });
    return true;
  }

  static async login(params) {
    const profile = await User.findOne({
      where: { email: params.email },
      raw: true,
    });
    if (!profile) {
      throw new CustomError(ERROR_CODES.INVALID_EMAIL_PASSWORD);
    }
    if (!(await bcrypt.compare(params.password, profile.password))) {
      throw new CustomError(ERROR_CODES.INVALID_EMAIL_PASSWORD);
    }
    const _token = issueToken({ id: profile.id, email: profile.email });
    return _token;
  }

  static async getProfile(params) {
    const _user = await User.findOne({
      where: { id: params.id },
      attributes: { exclude: ["password"] },
      raw: true,
    });
    return _user;
  }

  static async patch(params) {
    await User.update(
      {
        phone: params.phone,
      },
      {
        where: {
          id: params.loggedUser.id,
        },
      }
    );
    return true;
  }

  static async delete(params) {
    if (params.loggedUser.id == params.id) {
      throw new CustomError(ERROR_CODES.CANNOT_DELETE_LOGGED_USER);
    }
    await User.destroy({
      where: {
        id: params.id,
      },
    });
    return true;
  }
}
module.exports = { UserService };
