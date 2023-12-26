const nock = require("nock");
const { mockSequelize } = require("../index");
const lti = require("ltijs").Provider;
const axios = require("axios");

mockSequelize();
const { ltiService } = require("../../service/lti");
const { PlatformSetting } = require("../../../models/platformSetting");

const ERROR_CODES = require("../../constant/error-messages");
const SUCCESS_CODES = require("../../constant/success-messages");

jest.mock("../../../models/platformSetting", () => ({
  PlatformSetting: {
    findOne: jest.fn(),
  },
}));

describe("service/lti", () => {
  beforeEach(() => {
    PlatformSetting.findOne.mockReset();
    nock.cleanAll();
  });
  afterEach(() => {
    jest.resetAllMocks();
  });
  describe("registerPlatform", () => {
    let req;
    let res;

    beforeEach(() => {
      req = {
        body: {
          url: "xxxxxxxxxxxxxxx",
          name: "xxxxxxxxxxxxxxx",
          clientId: "xxxxxxxxxxxxxxx",
          authenticationEndpoint: "xxxxxxxxxxxxxxx",
          accesstokenEndpoint: "xxxxxxxxxxxxxxx",
          authConfigMethod: "xxxxxxxxxxxxxxx",
          authConfigKey: "xxxxxxxxxxxxxxx",
          secret: "xxxxxxxxxxxxxxx",
        },
      };

      res = {
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };
    });

    it("should return an error if the secret is invalid", async () => {
      process.env.ADMIN_SECRET = "valid-secret";
      req.body.secret = "invalid-secret";
      await ltiService.registerPlatform(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith(
        ERROR_CODES.INVALID_PARAMETERS.message
      );
    });

    it("should register the platform and return success", async () => {
      process.env.ADMIN_SECRET = "xxxxxxxxxxxxxxx";
      req.body.secret = "xxxxxxxxxxxxxxx";
      jest.spyOn(lti, "registerPlatform").mockResolvedValueOnce(true);
      await ltiService.registerPlatform(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.send).toHaveBeenCalledWith(
        SUCCESS_CODES.PLATFORM_REGISTERED_SUCCESSFULLY.message
      );
    });
  });

  describe("play", () => {
    let req;
    let res;
    jest.mock("axios");

    beforeEach(() => {
      req = {
        query: {
          c2eId: "id",
        },
      };

      res = {
        send: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };
    });

    it("should make a successful request to the external API and send the response", async () => {
      const mockData = { someKey: "someValue" };
      jest.spyOn(axios, "get").mockResolvedValueOnce({ data: mockData });
      await ltiService.play(req, res);
      expect(axios.get).toHaveBeenCalledWith(
        `${process.env.REACT_APP_BASEURL}play/${req.query.c2eId}`
      );
      expect(res.send).toHaveBeenCalledWith(mockData);
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe("info", () => {
    let req;
    let res;

    beforeEach(() => {
      req = {};

      res = {
        send: jest.fn(),
        locals: {
          token: 'mock-token',
          context: 'mock-context',
        },
      };
    });

    it("should get the info", async () => {
      await ltiService.info(req, res);
      expect(res.send).toHaveBeenCalledWith({ token: 'mock-token', context: 'mock-context' });
    });
  });

  describe("resources", () => {
    let req;
    let res;
    jest.mock("axios");

    beforeEach(() => {
      req = {
        query: {
          page: '1', // Replace with valid values for testing
          limit: '10',
          query: 'test',
        },
      };
  
      res = {
        locals: {
          token: { clientId: 'mock-client-id' }, // Adjust based on your application logic
        },
        status: jest.fn().mockReturnThis(),
        send: jest.fn(),
      };
    });
    it("should return error for no matching platform", async () => {
      PlatformSetting.findOne.mockResolvedValueOnce(null);
      await ltiService.resources(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should fetch resources", async () => {
      PlatformSetting.findOne.mockResolvedValueOnce({
        cee_provider_url: 'mock-provider-url',
        cee_licensee_id: 'mock-licensee-id',
        cee_secret_key: 'mock-secret-key',
      });
      jest.spyOn(axios, "get").mockResolvedValueOnce({data: true});
      await ltiService.resources(req, res);
      expect(res.send).toHaveBeenCalledWith(true);
    });

  });
  
});
