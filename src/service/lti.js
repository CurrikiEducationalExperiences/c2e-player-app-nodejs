const axios = require("axios");
const lti = require("ltijs").Provider;
const licensesUrl = `${process.env.C2E_SERVICES_API_BASE_URL}/licenses`;
const apiUser = process.env.C2E_SERVICES_API_USER;
const apiSecret = process.env.C2E_SERVICES_API_SECRET;
const fileUrl = `${process.env.C2E_SERVICES_API_BASE_URL}/c2e/licensed`;

class ltiService {
  static async grade(req, res) {
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
    return responseGrade;
  }

  static async members(req, res) {
    const result = await lti.NamesAndRoles.getMembers(res.locals.token);
    if (result) return result.members;
    return null;
  }

  static async deeplink(req, res) {
    const resource = req.body;

    const items = {
      type: "ltiResourceLink",
      title: "Ltijs Demo",
      url: `https://c2e-player-service.curriki.org/play?c2eId=${req.body.id}`,
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
    if (form) return form;
    return null;
  }

  static async play(req, res) {
    const c2eId = req.query.c2eId;
    const redirectUrl = `https://lti-epub-player-dev.curriki.org/play/${c2eId}`;

    const resp = await axios.get(redirectUrl);
    return resp.data;
  }

  static async info(req, res) {
    const token = res.locals.token;
    const context = res.locals.context;

    const info = {};
    if (token.userInfo) {
      if (token.userInfo.name) info.name = token.userInfo.name;
      if (token.userInfo.email) info.email = token.userInfo.email;
    }

    if (context.roles) info.roles = context.roles;
    if (context.context) info.context = context.context;

    info.context.errors = { errors: {} };
    if (info.context.errors) info.context.errors = [];

    return info;
  }

  static async resources(req, res) {
    const { page = 1, limit = 10, query = "" } = req.query;

    if (
      typeof page !== "number" ||
      typeof limit !== "number" ||
      typeof query !== "string"
    ) {
      return 400;
    }

    const params = {
      page,
      limit,
      query,
      email: apiUser,
      secret: apiSecret,
    };

    await axios
      .get(licensesUrl, { params })
      .then(async (response) => {
        return response.data;
      })
      .catch((error) => {
        res.send(error);
      });
  }

  static async stream(req, res) {
    const { ceeId } = req.query;
    const params = {
      ceeId: ceeId,
      email: apiUser,
      secret: apiSecret,
      decrypt: true,
    };
    const options = {
      method: "POST",
      responseType: "stream",
    };
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

  static async registerPlatform(params) {
    if (process.env.ADMIN_SECRET != req.body.secret)
    return false

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
    })
    return 'Platform registered successfully.';
  }
}
module.exports = { ltiService };
