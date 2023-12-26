const { AccountsController } = require("../../controllers/accounts");
const { AccountsService } = require("../../service/accounts");

describe("controller/accounts", () => {
  describe("post", () => {
    it("should craete a record", async () => {
      const req = {
        body: {
          userId: 1,
          facebook: true,
          instagram: true,
          twitter: false,
        },
      };
      const result = {
        code: 200,
        data: [],
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        result,
      };
      const next = jest.fn();
      jest.spyOn(AccountsService, "post").mockResolvedValueOnce(result);
      await AccountsController.post(req, res, next);
      expect(res.result).toEqual(result);
    });
  });

  describe("get", () => {
    it("should get all records", async () => {
      const req = {
        body: {},
        query: {
          page: 1,
          limit: 10,
        },
      };
      const result = {
        code: 200,
        data: [],
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        result,
      };
      const next = jest.fn();
      jest.spyOn(AccountsService, "get").mockResolvedValueOnce(result);
      await AccountsController.get(req, res, next);
      expect(res.result).toEqual(result);
    });
  });

  describe("update", () => {
    it("should update a record", async () => {
      const req = {
        body: {
          userId: 1,
          facebook: true,
          instagram: true,
          twitter: false,
        },
        params: { id: 1 },
      };
      const result = {
        code: 200,
        data: [],
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        result,
      };
      const next = jest.fn();
      jest.spyOn(AccountsService, "patch").mockResolvedValueOnce(result);
      await AccountsController.patch(req, res, next);
      expect(res.result).toEqual(result);
    });
  });

  describe("delete/:id", () => {
    it("should delete a record", async () => {
      const req = {
        body: {},
        params: { id: 1 },
      };
      const result = {
        code: 200,
        data: [],
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        result,
      };
      const next = jest.fn();
      jest.spyOn(AccountsService, "delete").mockResolvedValueOnce(result);
      await AccountsController.delete(req, res, next);
      expect(res.result).toEqual(result);
    });
  });
});
