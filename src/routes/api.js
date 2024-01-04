const express = require('express');
const router = express.Router();
const adminRouter = require('./admin');
const todoRouter = require('./todo');

const setRouter = (app) => {
  app.use('/api/v1', router);
  router.use(`/admin`, adminRouter);
  router.use(`/todo`, todoRouter);
};

module.exports = { setRouter };
