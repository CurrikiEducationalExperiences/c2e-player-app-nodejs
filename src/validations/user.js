const Joi = require('joi');

module.exports.register = Joi.object({
  name: Joi.string().required(),
  phone: Joi.string().required(),
  email: Joi.string().required(),
  password: Joi.string().required(),
});

module.exports.login = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required(),
});

module.exports.patch = Joi.object({
  phone: Joi.string().required(),
});

module.exports.delete = Joi.object({
  id: Joi.string().required(),
});
