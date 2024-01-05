require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const bodyParser = require("body-parser");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");
const { setRouter } = require("./routes/api");
const { globalErrorHandler } = require("./utils/response");

/////////////////// EXPRESS APP ///////////////////
const app = express();
app.server = http.createServer(app);

/////////////////// BODY PARSER ///////////////////
app.use(bodyParser.urlencoded({ extended: false }));

////////////// PARSE application/json /////////////
app.use(
  bodyParser.json({
    limit: `${process.env.BODYPARSER_LIMIT}kb`,
  })
);

////////////////////// CORS //////////////////////
app.use(
  cors({
    maxAge: process.env.CORS_MAX_AGE_SEC,
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
app.server.listen(process.env.PORT || 3000, () => {
  console.log(
    `Started server on => http://localhost:${app.server.address().port}`
  );
  console.log(
    `Docs available on => http://localhost:${
      app.server.address().port
    }/api-docs`
  );
});

module.exports = { app };
