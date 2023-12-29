const nock = require("nock");
const { mockSequelize } = require("../index");
const bcrypt = require("bcrypt");

mockSequelize();
const { AdminService } = require("../../service/admin");
const { Admin } = require("../../../models/admins");

const ERROR_CODES = require("../../constant/error-messages");

jest.mock("../../../models/admins", () => ({
  User: {
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    findOne: jest.fn(),
  },
}));

describe("service/admins", () => {
  beforeEach(() => {
    User.create.mockReset();
    User.update.mockReset();
    User.destroy.mockReset();
    User.findOne.mockReset();
    nock.cleanAll();
  });
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("register()", () => {
    const registerationDetails = {
      name: "Mehmood Hussain",
      phone: "+923000628070",
      email: "mehmood.hussain@tkxel246.com",
      password: "password",
    };

    it(`should throw error ${ERROR_CODES.USER_ALREADY_EXISTS.message}`, async () => {
      try {
        User.findOne.mockResolvedValueOnce({ abcd: "abcd" });
        await AdminService.register(registerationDetails);
      } catch (error) {
        expect(error.message).toBeDefined();
        expect(error.message).toEqual(ERROR_CODES.USER_ALREADY_EXISTS.message);
      }
    });

    it(`should create a user`, async () => {
      User.findOne.mockResolvedValueOnce(null);
      const response = await UserService.register(registerationDetails);
      expect(response).toBeDefined();
      expect(response).toBe(true);
    });
  });

  describe("login()", () => {
    const loginCreds = {
      email: "mehmood.hussain@tkxel246.com",
      password: "password",
    };

    it(`should throw error ${ERROR_CODES.INVALID_EMAIL_PASSWORD.message}`, async () => {
      try {
        User.findOne.mockResolvedValueOnce(null);
        await AdminService.login(loginCreds);
      } catch (error) {
        expect(error.message).toBeDefined();
        expect(error.message).toEqual(
          ERROR_CODES.INVALID_EMAIL_PASSWORD.message
        );
      }
    });

    it(`should throw error ${ERROR_CODES.INVALID_EMAIL_PASSWORD.message}`, async () => {
      try {
        User.findOne.mockResolvedValueOnce({ password: "123" });
        jest.spyOn(bcrypt, "compare").mockResolvedValueOnce(false);
        await AdminService.login(loginCreds);
      } catch (error) {
        expect(error.message).toBeDefined();
        expect(error.message).toEqual(
          ERROR_CODES.INVALID_EMAIL_PASSWORD.message
        );
      }
    });

    it(`should login a user`, async () => {
      User.findOne.mockResolvedValueOnce({ password: "123" });
      jest.spyOn(bcrypt, "compare").mockResolvedValueOnce(true);
      const response = await AdminService.login(loginCreds);
      expect(response).toBeDefined();
      expect(typeof response).toBe("string");
    });
  });

  describe("getProfile()", () => {
    it(`should return profile`, async () => {
      User.findOne.mockResolvedValueOnce({ id: 2 });
      const response = await AdminService.getProfile({ id: 2 });
      expect(response).toBeDefined();
      expect(response).toEqual({ id: 2 });
    });
  });

  describe("updatePassword()", () => {
    it(`should update admin password`, async () => {
      User.update.mockResolvedValueOnce(true);
      const response = await AdminService.patch({
        loggedUser: { id: 2 },
        phone: "00",
      });
      expect(response).toBeDefined();
      expect(response).toEqual(true);
    });
  });
  
});
