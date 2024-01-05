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
        status: jest.fn().mockReturnThis(),
        result,
      };
      const next = jest.fn();
      jest.spyOn(TodoService, "create").mockResolvedValueOnce(result);
      await TodoController.create(req, res, next);
      expect(res.result).toEqual(result);
    });
  });

  describe("get", () => {
    it("should get all todo data", async () => {
      const req = {};
      const result = {
        code: 200,
        data: [],
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        result,
      };
      const next = jest.fn();
      jest.spyOn(TodoService, "get").mockResolvedValueOnce(result);
      await TodoController.get(req, res, next);
      expect(res.result).toEqual(result);
    });
  });

  describe("update", () => {
    it("should update a todo entry", async () => {
      const req = {};
      const result = {
        code: 200,
        data: [],
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        result,
      };
      const next = jest.fn();
      jest.spyOn(TodoService, "update").mockResolvedValueOnce(result);
      await TodoController.update(req, res, next);
      expect(res.result).toEqual(result);
    });
  });

  describe("delete", () => {
    it("should delete a todo entry", async () => {
      const req = {};
      const result = {
        code: 200,
        data: [],
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        result,
      };
      const next = jest.fn();
      jest.spyOn(TodoService, "delete").mockResolvedValueOnce(result);
      await TodoController.delete(req, res, next);
      expect(res.result).toEqual(result);
    });
  });
});


