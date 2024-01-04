const { TodoService } = require("../service/todo");
const { responseHandler } = require("../utils/response");
class TodoController {
  static async create(req, res, next) {
    try {
      const result = await TodoService.create(req.body);
      return responseHandler({
        response: res,
        result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async get(req, res, next) {
    try {
      const result = await TodoService.get();
      return responseHandler({
        response: res,
        result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const result = await TodoService.update(req.body);
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
      const result = await TodoService.delete(req.query);
      return responseHandler({
        response: res,
        result,
      });
    } catch (error) {
      next(error);
    }
  }
  
}

module.exports = { TodoController };
