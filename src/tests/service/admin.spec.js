const bcrypt = require("bcrypt");
const { AdminService } = require("../../service/admin");
const { Admin } = require("../../../models/admins");
//const passCom = require("joi-password-complexity");

const ERROR_CODES = require("../../constant/error-messages");

jest.mock("../../../models/admins", () => ({
  Admin: {
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    findOne: jest.fn(),
  },
}));
// jest.mock("joi-password-complexity", () => {
//   return {
//       validate: { getMembers: jest.fn() },
//     }
// });
describe("service/admins", () => {
  beforeEach(() => {
    Admin.create.mockReset();
    Admin.update.mockReset();
    Admin.destroy.mockReset();
    Admin.findOne.mockReset();
  });
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("register()", () => {
    const registerationDetails = {
      name: "Mehmood Hussain",
      phone: "+923000628070",
      email: "mehmood.hussain@tkxel246.com",
      password: "Mehmood@Curriki1",
    };

    it(`should throw error ${ERROR_CODES.USER_ALREADY_EXISTS.message}`, async () => {
      try {
        Admin.findOne.mockResolvedValueOnce({ abcd: "abcd" });
        await AdminService.register(registerationDetails);
      } catch (error) {
        expect(error.message).toBeDefined();
        expect(error.message).toEqual(ERROR_CODES.USER_ALREADY_EXISTS.message);
      }
    });

    it(`should create a user`, async () => {
     // passCom.validate.mockResolvedValueOnce(true)
      Admin.findOne.mockResolvedValueOnce(null);
      const response = await AdminService.register(registerationDetails);
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
        Admin.findOne.mockResolvedValueOnce(null);
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
        Admin.findOne.mockResolvedValueOnce({ password: "123" });
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
      Admin.findOne.mockResolvedValueOnce({ password: "123" });
      jest.spyOn(bcrypt, "compare").mockResolvedValueOnce(true);
      const response = await AdminService.login(loginCreds);
      expect(response).toBeDefined();
      expect(typeof response).toBe("string");
    });
  });

  describe("getProfile()", () => {
    it(`should return profile`, async () => {
      Admin.findOne.mockResolvedValueOnce({ id: 2 });
      const response = await AdminService.getProfile({ id: 2 });
      expect(response).toBeDefined();
      expect(response).toEqual({ id: 2 });
    });
  });

  describe("updatePassword()", () => {
    it(`should update admin password`, async () => {
      Admin.findOne.mockResolvedValueOnce({password: "asd"});
      jest.spyOn(bcrypt, "compare").mockResolvedValueOnce(true);
      Admin.update.mockResolvedValueOnce(true);
      const response = await AdminService.updatePassword({
        loggedUser: { id: 2 },
        password: "Mehmood@Curriki1",
        newPassword: "Mehmood@Curriki3",
      });
      expect(response).toBeDefined();
      expect(response).toEqual(true);
    });
  });
  
});
