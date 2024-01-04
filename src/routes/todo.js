const express = require("express");
const todoRouter = express.Router();
const { TodoController } = require("../controllers/todo");
const validationMiddleware = require("../middleware/validation");
const todoValdations = require("../validations/todo");
//const { authMiddleware } = require("../middleware/auth");

todoRouter.post(
  "/create",
  validationMiddleware(todoValdations.create),
  TodoController.create
);
todoRouter.get(
  "/get",
  TodoController.get
);
todoRouter.patch(
  "/update",
//  authMiddleware,
  validationMiddleware(todoValdations.update),
  TodoController.update
);
todoRouter.delete(
  "/delete",
  validationMiddleware(todoValdations.delete, (isGet = true)),
  TodoController.delete
);

module.exports = todoRouter;
