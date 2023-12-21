const Joi = require('joi');

module.exports.registerPlatform = Joi.object({
  url: Joi.string().max(500).required(),
  name: Joi.string().max(500).required(),
  clientId: Joi.string().max(500).required(),
  authenticationEndpoint: Joi.string().max(1000).required(),
  accesstokenEndpoint: Joi.string().max(1000).required(),
  authConfigMethod: Joi.string().max(500).required(),
  authConfigKey: Joi.string().max(500).required(),
  secret: Joi.string().max(500).required(),
});

module.exports.grade = Joi.object({
  grade: Joi.number().min(0).max(100000000).required(),
});

module.exports.play = Joi.object({
  c2eId: Joi.string().max(100000000).required(),
});

module.exports.deeplink = Joi.object({
  title: Joi.string().max(10000).required(),
  name: Joi.string().max(10000).required(),
  value: Joi.string().max(10000).required(),
  id: Joi.string().max(10000).required(),
});

module.exports.resources = Joi.object({
  page: Joi.page().min(1).max(10000).required(),
  limit: Joi.limit().min(1).max(10000).required(),
  query: Joi.string().max(10000).required(),
});

module.exports.stream = Joi.object({
  ceeId: Joi.string().max(10000).required(),
});

module.exports.xapi = Joi.object({
  id: Joi.string().max(10000).required(),
  verb: Joi.string().max(10000).required(),
});
