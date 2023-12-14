const { UserService } = require("../service/user");

const { responseHandler } = require("../utils/response");

class UserController {
  static async register(req, res, next) {
    try {
      const result = await UserService.register(req.body);
      return responseHandler({
        response: res,
        result,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async login(req, res, next) {
    try {
      const result = await UserService.login(req.body);
      return responseHandler({
        response: res,
        result,
      });
    } catch (error) {
      next(error);
    }
  }
  
  static async getProfile(req, res, next) {
    try {
      const result = await UserService.getProfile(req.loggedUser);
      return responseHandler({
        response: res,
        result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async patch(req, res, next) {
    try {
      req.body.loggedUser = req.loggedUser;
      const result = await UserService.patch(req.body);
      return responseHandler({
        response: res,
        result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      req.params.loggedUser = req.loggedUser;
      const result = await UserService.delete(req.params);
      return responseHandler({
        response: res,
        result,
      });
    } catch (error) {
      if (error.message.includes("foreign key"))
        return responseHandler({
          response: res,
          result: null,
        });
      next(error);
    }
  }
}

module.exports = { UserController };
