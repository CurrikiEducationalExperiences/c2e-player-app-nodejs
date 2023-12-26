const { UserController } = require("../../controllers/user");
const { UserService } = require("../../service/user");

describe("controller/user", () => {
  describe("register", () => {
    it("should register a user", async () => {
      const req = {
        body: {
          name: "Mehmood Hussain",
          phone: "+923000628070",
          email: "mehmood.hussain@tkxel246.com",
          password: "password",
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
      jest.spyOn(UserService, "register").mockResolvedValueOnce(result);
      await UserController.register(req, res, next);
      expect(res.result).toEqual(result);
    });
  });

  describe("login", () => {
    it("should login a user", async () => {
      const req = {
        body: {
          email: "mehmood.hussain@tkxel246.com",
          password: "password",
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
      jest.spyOn(UserService, "login").mockResolvedValueOnce(result);
      await UserController.login(req, res, next);
      expect(res.result).toEqual(result);
    });
  });

  describe("getProfile", () => {
    it("should get profile of aigned in user", async () => {
      const req = {
        body: {},
        user: {
          id: 1,
          email: "someone@email.com",
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
      jest.spyOn(UserService, "getProfile").mockResolvedValueOnce(result);
      await UserController.getProfile(req, res, next);
      expect(res.result).toEqual(result);
    });
  });

  describe("update", () => {
    it("should update signed in user", async () => {
      const req = {
        body: {
          phone: "+923000628070",
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
      jest.spyOn(UserService, "patch").mockResolvedValueOnce(result);
      await UserController.patch(req, res, next);
      expect(res.result).toEqual(result);
    });
  });

  describe("delete/:id", () => {
    it("should delete a user", async () => {
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
      jest.spyOn(UserService, "delete").mockResolvedValueOnce(result);
      await UserController.delete(req, res, next);
      expect(res.result).toEqual(result);
    });
  });
});
