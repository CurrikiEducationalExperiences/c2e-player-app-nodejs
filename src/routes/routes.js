const express = require("express");
const path = require("path");
const validationMiddleware = require("../middleware/validation");
const ltiValidations = require("../validations/lti");
const { ltiController } = require("../controllers/lti");
const ltiRouter = express.Router();

ltiRouter.post("/grade", ltiController.grade);
ltiRouter.get("/members", ltiController.members);
ltiRouter.post("/deeplink", ltiController.deeplink);
ltiRouter.post("/play", ltiController.play);
ltiRouter.get("/info", ltiController.info);
ltiRouter.get("/resources", ltiController.resources);
ltiRouter.get("/stream", ltiController.stream);
ltiRouter.get("/xapi/statements", ltiController.xapi);
ltiRouter.post("/platform/register", validationMiddleware(ltiValidations.registerPlatform), ltiController.registerPlatform);

ltiRouter.get("*", (req, res) =>
  res.sendFile(path.join(__dirname, "../../public/index.html"))
);

module.exports = ltiRouter;
