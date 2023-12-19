require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const lti = require("ltijs").Provider;
const Database = require("ltijs-sequelize");
const swaggerDocument = require("./swagger.json");
const routes = require("./routes/routes");
const { setRouter } = require("./routes/api");
const { globalErrorHandler } = require("./utils/response");

const db = new Database(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    logging: false,
  }
);

/////////////////// EXPRESS APP ///////////////////
const app = express();
app.server = http.createServer(app);

/////////////////// BODY PARSER ///////////////////
app.use(bodyParser.urlencoded({ extended: false }));
////////////// PARSE application/json /////////////
app.use(
  bodyParser.json({
    limit: "2000kb",
  })
);

// cors
app.use(
  cors({
    maxAge: 2628000, //  Access-Control-Max-Age: 1 month
  })
);

/////////////////// SWAGGER UI ///////////////////
if (process.env.ENV === "development") {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}

/////////////// SET PUBLIC ROUTER ////////////////
setRouter(app);

/////// GLOBAL ERROR LANDLER AS MIDDLEWARE //////
app.use((err, req, res, next) => globalErrorHandler(err, req, res, next));

////////////// EXPRESS APP SERVER ///////////////
app.server.listen(process.env.SERVER_PORT || 3000, () => {
  console.log(
    `Started server on => http://localhost:${app.server.address().port}`
  );
  console.log(
    `Docs available on => http://localhost:${
      app.server.address().port
    }/api-docs`
  );
});

////////////////// LTI SETUP //////////////////
lti.setup(
  process.env.LTI_KEY,
  {
    plugin: db,
  },
  {
    tokenMaxAge: false,
    staticPath: path.join(__dirname, '../public'), //  Path to static files
    cookies: {
      secure: false, // Set secure to true if the testing platform is in a different domain and https is being used
      sameSite: '', // Set sameSite to 'None' if the testing platform is in a different domain and https is being used
    },
    devMode: true, // Set DevMode to true if the testing platform is in a different domain and https is not being used
    dynRegRoute: '/register', // Setting up dynamic registration route. Defaults to '/register'
    dynReg: {
      url: 'http://localhost:3000', // Tool Provider URL. Required field.
      name: 'Tool Provider', // Tool Provider name. Required field.
      logo: 'http://localhost:3000/logo512.png', // Tool Provider logo URL.
      description: 'Tool Description', // Tool Provider description.
      redirectUris: ['http://localhost:3000/launch'], // Additional redirection URLs. The main URL is added by default.
      customParameters: { key: "value" }, // Custom parameters.
      autoActivate: true, // Whether or not dynamically registered Platforms should be automatically activated. Defaults to false.
    },
  }
);

lti.onConnect(async (token, req, res) => {
  return res.sendFile(path.join(__dirname, "../public/index.html"));
});

lti.onDeepLinking(async (token, req, res) => {
  if (req.query.c2eId) {
    return lti.redirect(res, "/lti/play", { newResource: true });
  } else {
    return lti.redirect(res, "/lti/deeplink", { newResource: true });
  }
});

//////////////// SET LTI ROUTES //////////////
app.use("/lti", lti.app);
lti.app.use(routes);

///////////// LTI SETUP FUNCTION ///////////
const setup = async () => {
  await lti.deploy({ serverless: true });
  await lti.registerPlatform({
    url: "https://canvas.instructure.com",
    name: "Curriki Studio",
    clientId: "208830000000000160",
    authenticationEndpoint: "https://curriki.instructure.com/api/lti/authorize_redirect",
    accesstokenEndpoint: "https://curriki.instructure.com/login/oauth2/token",
    authConfig: {
      method: "JWK_SET",
      key: "https://curriki.instructure.com/api/lti/security/jwks",
    },
  });
};
setup();

module.exports = { app };

