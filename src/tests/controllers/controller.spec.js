const { TodoController } = require("../../controllers/todo");
const { TodoService } = require("../../service/todo");

describe("controller/todo", () => {
  describe("create", () => {
    it("should create a todo entry", async () => {
      const req = {};
      const result = {
        code: 200,
        data: [],
      };
      const res = {
        result,
      };
      const next = jest.fn();
      jest.spyOn(TodoService, "create").mockResolvedValueOnce(result);
      await TodoController.create(req, res, next);
      expect(res.result).toEqual(result);
    });
  });

});
