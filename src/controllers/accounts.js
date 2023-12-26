const {AccountsService} = require('../service/accounts');

const {
  responseHandler,
} = require('../utils/response');

class AccountsController {
  static async post(req, res, next) {
    try {
      const result = await AccountsService.post(req.body);
      return responseHandler({
        response: res,
        result
      });
    } catch (error) {
      next(error);
    }  
  }
  static async get(req, res, next) {
    try {
      const result = await AccountsService.get(req.query);
      return responseHandler({
        response: res,
        result
      });
    } catch (error) {
      next(error);
    }  
  }
  static async patch(req, res, next) {
    try {
      const result = await AccountsService.patch(req.body);
      return responseHandler({
        response: res,
        result
      });
    } catch (error) {
      next(error);
    }  
  }
  static async delete(req, res, next) {
    try {
      const result = await AccountsService.delete(req.body);
      return responseHandler({
        response: res,
        result
      });
    } catch (error) {
      next(error);
    }  
  }
}

module.exports = { AccountsController };
