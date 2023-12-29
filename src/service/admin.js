const bcrypt = require("bcrypt");
const ERROR_CODES = require("../constant/error-messages");
const CustomError = require("../utils/error");
const { Admin } = require("../../models/admins");
const { issueToken } = require("../middleware/auth");
class AdminService {
  static async register(params) {
    const existingProfile = await Admin.findOne({
      where: { email: params.email },
      raw: true,
    });
    if (existingProfile) {
      throw new CustomError(ERROR_CODES.USER_ALREADY_EXISTS);
    }
    await Admin.create({
      name: params.name,
      email: params.email,
      phone: params.phone,
      password: bcrypt.hashSync(params.password, bcrypt.genSaltSync(2)),
    });
    return true;
  }

  static async login(params) {
    const profile = await Admin.findOne({
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
    const _user = await Admin.findOne({
      where: { id: params.id },
      attributes: { exclude: ["password"] },
      raw: true,
    });
    return _user;
  }

  static async updatePassword(params) {
    await Admin.update(
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

  static async forgetPassword(params) {
    await Admin.update(
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

  static async resetPassword(params) {
    await Admin.update(
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

}
module.exports = { AdminService };
