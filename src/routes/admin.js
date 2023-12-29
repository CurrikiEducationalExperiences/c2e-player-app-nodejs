const express = require("express");
const adminRouter = express.Router();
const { AdminController } = require("../controllers/admin");
const validationMiddleware = require("../middleware/validation");
const adminValdations = require("../validations/admin");
const { authMiddleware } = require("../middleware/auth");

adminRouter.post(
  "/register",
  validationMiddleware(adminValdations.register),
  AdminController.register
);
adminRouter.post(
  "/login",
  validationMiddleware(adminValdations.login),
  AdminController.login
);
adminRouter.get("/getProfile", authMiddleware, AdminController.getProfile);
adminRouter.patch(
  "/updatePassword",
  authMiddleware,
  validationMiddleware(adminValdations.updatePassword),
  AdminController.patch
);
adminRouter.post("/forgetPassword", validationMiddleware(adminValdations.forgetPassword),
AdminController.delete);
adminRouter.post("/resetPassword", validationMiddleware(adminValdations.resetPassword),
AdminController.delete);

module.exports = adminRouter;
