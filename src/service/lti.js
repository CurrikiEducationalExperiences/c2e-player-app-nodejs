const axios = require("axios");
const lti = require("ltijs").Provider;
const { PlatformSetting } = require("../../models/platformSetting");
const ERROR_CODES = require("../constant/error-messages");
const SUCCESS_CODES = require("../constant/success-messages");
class ltiService {
  static async grade(req, res) {
    try {
      const idtoken = res.locals.token; // IdToken
      const score = req.body.grade; // User numeric score sent in the body
      // Creating Grade object
      const gradeObj = {
        userId: idtoken.user,
        scoreGiven: score,
        scoreMaximum: 100,
        activityProgress: "Completed",
        gradingProgress: "FullyGraded",
      };

      // Selecting linetItem ID
      let lineItemId = idtoken.platformContext.endpoint.lineitem; // Attempting to retrieve it from idtoken
      if (!lineItemId) {
        const response = await lti.Grade.getLineItems(idtoken, {
          resourceLinkId: true,
        });
        const lineItems = response.lineItems;
        if (lineItems.length === 0) {
          // Creating line item if there is none
          console.log("Creating new line item");
          const newLineItem = {
            scoreMaximum: 100,
            label: "Grade",
            tag: "grade",
            resourceLinkId: idtoken.platformContext.resource.id,
          };
          const lineItem = await lti.Grade.createLineItem(idtoken, newLineItem);
          lineItemId = lineItem.id;
        } else lineItemId = lineItems[0].id;
      }

      // Sending Grade
      const responseGrade = await lti.Grade.submitScore(
        idtoken,
        lineItemId,
        gradeObj
      );
      return res.send(responseGrade);
    } catch (err) {
      console.log(err.message);
      return res.status(500).send({ err: err.message });
    }
  }

  static async members(req, res) {
    try {
      const result = await lti.NamesAndRoles.getMembers(res.locals.token);
      if (result) return res.send(result.members);
      return res.sendStatus(500);
    } catch (err) {
      console.log(err.message);
      return res.status(500).send(err.message);
    }
  }

  static async deeplink(req, res) {
    try {
      const resource = req.body;

      const items = {
        type: "ltiResourceLink",
        title: resource.title,
        url: `${process.env.NODE_APP_BASEURL}play?c2eId=${resource.id}`,
        custom: {
          name: resource.name,
          value: resource.value,
        },
      };

      const form = await lti.DeepLinking.createDeepLinkingForm(
        res.locals.token,
        items,
        { message: `Successfully Registered` }
      );
      if (form) return res.send(form);
      return res.sendStatus(500);
    } catch (err) {
      console.log(err.message);
      return res.status(500).send(err.message);
    }
  }

  static async play(req, res) {
    try {
      const c2eId = req.query.c2eId;
      const redirectUrl = `${process.env.REACT_APP_BASEURL}play/${c2eId}`;

      const resp = await axios.get(redirectUrl);
      return res.send(resp.data);
    } catch (err) {
      console.log(err.message);
      return res.status(500).send(err.message);
    }
  }

  static async info(req, res) {
    const token = res.locals.token;
    const context = res.locals.context;
    return res.send({ token, context });
  }

  static async resources(req, res) {
    let { page = 1, limit = 10, query = "" } = req.query;
    // need to remove this code as requset filtering is added
    if (
      isNaN(parseInt(page)) ||
      isNaN(parseInt(limit)) ||
      typeof query !== "string"
    ) {
      return res.status(400).send({
        status: 400,
        error: "Invalid parameter type",
        details: {
          description: "The query params provided are not formatted properly",
          message: "Invalid parameter type",
        },
      });
    }
    var platformSettings = await PlatformSetting.findOne({
      where: { lti_client_id: res.locals.token.clientId },
    });
    if (!platformSettings) {
      return res.status(400).send({
        status: 400,
        error: ERROR_CODES.NO_MATCHING_PLATFORM_FOUND.message,
        details: {
          description: ERROR_CODES.NO_MATCHING_PLATFORM_FOUND.description,
          message: ERROR_CODES.NO_MATCHING_PLATFORM_FOUND.message,
        },
      });
    }

    const licensesUrl = `${platformSettings.cee_provider_url}/licenses`;
    const params = {
      page,
      limit: 9000, // needs to update this static value
      query,
      email: platformSettings.cee_licensee_id,
      secret: platformSettings.cee_secret_key,
    };
    await axios
      .get(licensesUrl, { params })
      .then(async (response) => {
        return res.send(response.data);
      })
      .catch((error) => {
        res.status(400).send({
          status: 400,
          error: ERROR_CODES.FAILED_TO_RETRIEVE_LICENSE.message,
          details: {
            description: ERROR_CODES.FAILED_TO_RETRIEVE_LICENSE.description,
            message: ERROR_CODES.FAILED_TO_RETRIEVE_LICENSE.message,
          },
        });
      });
  }

  static async stream(req, res) {
    var platformSettings = await PlatformSetting.findOne({
      where: { lti_client_id: res.locals.token.clientId },
    });
    if (!platformSettings) {
      return res.status(400).send({
        status: 400,
        error: ERROR_CODES.NO_MATCHING_PLATFORM_FOUND.message,
        details: {
          description: ERROR_CODES.NO_MATCHING_PLATFORM_FOUND.description,
          message: ERROR_CODES.NO_MATCHING_PLATFORM_FOUND.message,
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
        error: ERROR_CODES.FAILED_TO_STREAM_FILE.message,
        details: {
          description: ERROR_CODES.FAILED_TO_STREAM_FILE.description,
          message: ERROR_CODES.FAILED_TO_STREAM_FILE.message,
        },
      });
    }
  }

  static async xapi(req, res) {
    var platformSettings = await PlatformSetting.findOne({
      where: { lti_client_id: res.locals.token.clientId },
    });
    if (!platformSettings) {
      return res.status(400).send({
        status: 400,
        error: ERROR_CODES.NO_MATCHING_PLATFORM_FOUND.message,
        details: {
          description: ERROR_CODES.NO_MATCHING_PLATFORM_FOUND.description,
          message: ERROR_CODES.NO_MATCHING_PLATFORM_FOUND.message,
        },
      });
    }

    if (!req.body.id || !req.body.verb) {
      return res.status(400).send({
        status: 400,
        error: ERROR_CODES.NO_XAPI_STATEMENT_PROVIDED.message,
        details: {
          description: ERROR_CODES.NO_XAPI_STATEMENT_PROVIDED.description,
          message: ERROR_CODES.NO_XAPI_STATEMENT_PROVIDED.message,
        },
      });
    }

    const params = {
      statement: JSON.stringify(req.body),
      email: platformSettings.cee_licensee_id,
      secret: platformSettings.cee_secret_key,
    };

    const xapiServiceUrl = `${platformSettings.cee_provider_url}/xapi`;
    await axios
      .post(xapiServiceUrl, params)
      .then(async (response) => {
        return res.send(response.data);
      })
      .catch((error) => {
        console.log(error);
        return res.status(400).send({
          status: 400,
          error: ERROR_CODES.FAILED_TO_SEND_XAPI_STATEMENT_TO_PROVIDER_SERVICE_PROVIDER.message,
          details: {
            description: ERROR_CODES.FAILED_TO_SEND_XAPI_STATEMENT_TO_PROVIDER_SERVICE_PROVIDER.description,
            message: ERROR_CODES.FAILED_TO_SEND_XAPI_STATEMENT_TO_PROVIDER_SERVICE_PROVIDER.message,
          },
        });
      });
  }

  static async registerPlatform(req, res) {
    const params = req.body;
    if (process.env.ADMIN_SECRET != params.secret)
      return res.status(400).send(ERROR_CODES.INVALID_PARAMETERS.message);

    await lti.registerPlatform({
      url: params.url,
      name: params.name,
      clientId: params.clientId,
      authenticationEndpoint: params.authenticationEndpoint,
      accesstokenEndpoint: params.accesstokenEndpoint,
      authConfig: {
        method: params.authConfigMethod,
        key: params.authConfigKey,
      },
    });
    return res.status(200).send(SUCCESS_CODES.PLATFORM_REGISTERED_SUCCESSFULLY.message);
  }
}

module.exports = { ltiService };
