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
    const response = await ltiService.grade(req, res);
    return res.status(response.code).send(response.data);
  }
  
  static async members(req, res) {
    const response = await ltiService.members(req, res);
    return res.status(response.code).send(response.data);
  }
  
  static async deeplink(req, res) {
    const response = await ltiService.deeplink(req, res);
    return res.status(response.code).send(response.data);
  }
  
  static async play(req, res) {
    const response = await ltiService.play(req, res);
    return res.status(response.code).send(response.data);
  }

  static async info(req, res) {
    const response = await ltiService.info(req, res);
    return res.status(response.code).send(response.data);
  }

  static async resources(req, res) {
    const response = await ltiService.resources(req, res);
    return res.status(response.code).send(response.data);
  }

  static async stream(req, res) {
    var platformSettings = await PlatformSetting.findOne({
      where: { lti_client_id: res.locals.token.clientId },
    });
    if (!platformSettings) {
      return res.status(400).send({
        status: 400,
        error: "No matching platform settings found",
        details: {
          description:
            "Your LTI authentication information doesn't match any existing platform settings in the C2E player",
          message: "No matching platform settings found",
        },
      });
    }

    const { ceeId } = req.query;
    const params = {
      ceeId: ceeId,
      email: platformSettings.cee_licensee_id,
      secret: platformSettings.cee_secret_key,
      decrypt: true,
    };
    const options = {
      method: "POST",
      responseType: "stream",
    };
    const fileUrl = `${platformSettings.cee_provider_url}/c2e/licensed`;
    try {
      const response = await axios.post(fileUrl, params, options);
      const fileStream = response.data;
      const fileName = `${ceeId}.c2e`;
      const fileMime = "application/zip";
      const fileLength = response.headers["content-length"];
      const headers = {
        "Content-Type": fileMime,
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": fileLength,
      };
      res.writeHead(200, headers);
      fileStream.pipe(res);
    } catch (e) {
      return res.status(400).send({
        status: 400,
        error: "Failed to stream file",
        details: {
          description:
            "Could not stream C2E content. Please check your licensee settings and query params",
          message: "Failed to stream file",
        },
      });
    }
  }

  static async xapi(req, res) {
    var platformSettings = await PlatformSetting.findOne({ where: {lti_client_id: res.locals.token.clientId}});
    if (!platformSettings) {
        return res.status(400).send({
            status: 400,
            error: "No matching platform settings found",
            details: {
              description: "Your LTI authentication information doesn't match any existing platform settings in the C2E player",
              message: "No matching platform settings found"
            }
          });
    }

    if (!req.body.id || !req.body.verb){
        return res.status(400).send({
            status: 400,
            error: "No xAPI statement provided",
            details: {
              description: "The request params provided do not match a valid xAPI statement format",
              message: "No xAPI statement provided"
            }
        });
    }

    const params = {
        statement: JSON.stringify(req.body),
        email: platformSettings.cee_licensee_id,
        secret: platformSettings.cee_secret_key,
    };

    const xapiServiceUrl = `${platformSettings.cee_provider_url}/xapi`;
    await axios.post(xapiServiceUrl, params)
    .then(async (response) => {
        return res.send(response.data);
    })
    .catch((error) => {
        console.log(error);
        return res.status(400).send({
            status: 400,
            error: "Failed to send  xAPI statement to service provider",
            details: {
              description: "Failed to send  xAPI statement to service provider. Check your integration settings",
              message: "Failed to send  xAPI statement to service provider"
            }
        });
    });
  }

  static async registerPlatform(req, res) {
    try {
      const result = await ltiService.registerPlatform(req.body);
      if (!result) return res.status(400).send("Invalid parameters.");
      return res.status(200).send("Platform registered successfully.");
    } catch (err) {
      console.log(err.message);
      return res.status(500).send({ err: err.message });
    }
  }
}

module.exports = { ltiController };
