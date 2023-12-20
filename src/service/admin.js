const lti = require("ltijs").Provider;
class AdminService {
  static async registerPlatform(params) {
    if (process.env.ADMIN_SECRET != params.secret) return false;

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
    return true;
  }
}
module.exports = { AdminService };
