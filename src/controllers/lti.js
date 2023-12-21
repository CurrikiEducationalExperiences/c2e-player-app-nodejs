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
  }

  static async resources(req, res) {
    await ltiService.resources(req, res);
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

    if (!req.body.id || !req.body.verb) {
      return res.status(400).send({
        status: 400,
        error: "No xAPI statement provided",
        details: {
          description:
            "The request params provided do not match a valid xAPI statement format",
          message: "No xAPI statement provided",
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
          error: "Failed to send  xAPI statement to service provider",
          details: {
            description:
              "Failed to send  xAPI statement to service provider. Check your integration settings",
            message: "Failed to send  xAPI statement to service provider",
          },
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
