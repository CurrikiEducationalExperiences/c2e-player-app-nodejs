const axios = require("axios");
const lti = require("ltijs").Provider;
const licensesUrl = `${process.env.C2E_SERVICES_API_BASE_URL}/licenses`;
const apiUser = process.env.C2E_SERVICES_API_USER;
const apiSecret = process.env.C2E_SERVICES_API_SECRET;
const fileUrl = `${process.env.C2E_SERVICES_API_BASE_URL}/c2e/licensed`;

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
        url: `https://c2e-player-app-nodejs-stage.curriki.org/play?c2eId=${resource.id}`,
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
      const redirectUrl = `https://lti-epub-player-dev.curriki.org/play/${c2eId}`;

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

    const info = {};
    if (token.userInfo) {
      if (token.userInfo.name) info.name = token.userInfo.name;
      if (token.userInfo.email) info.email = token.userInfo.email;
    }

    if (context.roles) info.roles = context.roles;
    if (context.context) info.context = context.context;

    info.context.errors = { errors: {} };
    if (info.context.errors) info.context.errors = [];

    return res.send(info);
  }

  static async resources(req, res) {
    const { page = 1, limit = 10, query = "" } = req.query;

    if (
      isNaN(parseInt(page)) ||
      isNaN(parseInt(limit)) ||
      typeof query !== "string"
    ) {
      return res.status(400).send("Invalid parameter type");
    }

    var platformSettings = await PlatformSetting.findOne({
      where: { lti_client_id: res.locals.token.clientId },
    });
    if (!platformSettings) {
      return res.status(400).send("No matching platform settings found.");
    }

    const licensesUrl = `${platformSettings.cee_provider_url}/licenses`;
    const params = {
      page,
      limit: 9000,
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
        res.send(error);
      });
  }

  static async stream(req, res) {
    var platformSettings = await PlatformSetting.findOne({
      where: { lti_client_id: res.locals.token.clientId },
    });
    if (!platformSettings) {
      return res.status(400).send("No matching platform settings found.");
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
      console.log("CeeStreamController Error:", e);
      res.send({ error: "Failed to stream file" });
    }
  }

  static async xapi(req, res) {
    if (!req.body.id || !req.body.verb)
      return res.status(400).send("No xAPI statement provided.");

    const params = {
      statement: JSON.stringify(req.body),
      email: apiUser,
      secret: apiSecret,
    };

    await axios
      .post(xapiServiceUrl, params)
      .then(async (response) => {
        return res.send(response.data);
      })
      .catch((error) => {
        console.log(error);
        res.send({
          error: "Error: Failed to send  xAPI statement to service provider",
        });
      });
  }
  
  static async registerPlatform(params) {
    if (process.env.ADMIN_SECRET != params.secret) res.status(400).send('Invalid secret.');

    const response = await lti.registerPlatform({
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
    return res.status(200).send("Platform registered successfully.");
  }
}
module.exports = { ltiService };
