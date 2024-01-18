const Joi = require('joi');

module.exports.register = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required(),
});

module.exports.login = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required(),
});

module.exports.updatePassword = Joi.object({
  password: Joi.string().required(),
  newPassword: Joi.string().required(),
});

module.exports.forgetPassword = Joi.object({
  email: Joi.string().required(),
});

module.exports.template = Joi.object({
  page: Joi.number().min(1).max(100).required(),
  limit: Joi.number().min(1).max(100).required(),
});

module.exports.resetPassword = Joi.object({
  password: Joi.string().required(),
  token: Joi.string().required(),
});
