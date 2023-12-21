const express = require("express");
const accountsRouter = express.Router();
const { AccountsController } = require("../controllers/accounts");
const validationMiddleware = require("../middleware/validation");
const accountsValdations = require("../validations/accounts");

accountsRouter.post(
  "/post",
  validationMiddleware(accountsValdations.post),
  AccountsController.post
);
accountsRouter.get(
  "/get",
  validationMiddleware(accountsValdations.get, (isGet = true)),
  AccountsController.get
);
accountsRouter.patch(
  "/update",
  validationMiddleware(accountsValdations.patch),
  AccountsController.patch
);
accountsRouter.delete("/delete", AccountsController.delete);

module.exports = accountsRouter;
