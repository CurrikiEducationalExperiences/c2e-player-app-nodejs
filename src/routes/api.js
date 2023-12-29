const express = require('express');
const router = express.Router();
const adminRouter = require('./admin');
const accountsRouter = require('./accounts');

const setRouter = (app) => {
  app.use('/api/v1', router);
  router.use(`/admin`, adminRouter);
  router.use(`/accounts`, accountsRouter);
};

module.exports = { setRouter };
