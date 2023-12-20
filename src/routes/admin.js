const express = require("express");
const { AdminController } = require("../controllers/admin");

const adminRouter = express.Router();
const validationMiddleware = require("../middleware/validation");
const adminValdations = require("../validations/admin");

adminRouter.post(
  "/platform/register",
  validationMiddleware(adminValdations.registerPlatform),
  AdminController.registerPlatform
);

module.exports = adminRouter;
