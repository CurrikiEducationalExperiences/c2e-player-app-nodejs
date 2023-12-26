const express = require("express");
const userRouter = express.Router();
const { UserController } = require("../controllers/user");
const validationMiddleware = require("../middleware/validation");
const userValdations = require("../validations/user");
const { authMiddleware } = require("../middleware/auth");

userRouter.post(
  "/register",
  validationMiddleware(userValdations.register),
  UserController.register
);
userRouter.post(
  "/login",
  validationMiddleware(userValdations.login),
  UserController.login
);
userRouter.get("/getProfile", authMiddleware, UserController.getProfile);
userRouter.patch(
  "/update",
  authMiddleware,
  validationMiddleware(userValdations.patch),
  UserController.patch
);
userRouter.delete("/delete/:id", authMiddleware, UserController.delete);

module.exports = userRouter;
