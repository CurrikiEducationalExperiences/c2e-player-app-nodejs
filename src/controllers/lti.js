const axios = require("axios");
const lti = require("ltijs").Provider;
const licensesUrl = `${process.env.C2E_SERVICES_API_BASE_URL}/licenses`;
const apiUser = process.env.C2E_SERVICES_API_USER;
const apiSecret = process.env.C2E_SERVICES_API_SECRET;
const fileUrl = `${process.env.C2E_SERVICES_API_BASE_URL}/c2e/licensed`;
const { PlatformSetting } = require("../../models/platformSetting");
const { ltiService } = require("../service/lti");

class ltiController {
  static async grade(req, res) {
    await ltiService.grade(req, res);
  }

  static async members(req, res) {
    await ltiService.members(req, res);
  }

  static async deeplink(req, res) {
    await ltiService.deeplink(req, res);
  }

  static async play(req, res) {
    await ltiService.play(req, res);
  }

  static async info(req, res) {
    await ltiService.info(req, res);
  }

  static async resources(req, res) {
    await ltiService.resources(req, res);
  }

  static async stream(req, res) {
    await ltiService.stream(req, res);
  }

  static async xapi(req, res) {
    await ltiService.xapi(req, res);
  }

  static async registerPlatform(req, res) {
    await ltiService.registerPlatform(req, res);
  }
}

module.exports = { ltiController };
