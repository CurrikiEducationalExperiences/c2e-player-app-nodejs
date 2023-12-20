const express = require('express');
const userRouter = require('./user');
const accountsRouter = require('./accounts');
const adminRouter = require('./admin');

const router = express.Router();

const setRouter = (app) => {
  app.use('/api/v1', router);
  router.use(`/users`, userRouter);
  router.use(`/accounts`, accountsRouter);
  router.use('/admin', adminRouter);
};

module.exports = { setRouter };
