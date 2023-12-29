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
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().required(),
  confirmPassword: Joi.string().required(),
});

module.exports.forgetPassword = Joi.object({
  email: Joi.string().required(),
});

module.exports.resetPassword = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required(),
  confirmPassword: Joi.string().required(),
  otp: Joi.string().required(),
});
