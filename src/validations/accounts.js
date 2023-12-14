const Joi = require('joi');

module.exports.post = Joi.object({
  userId: Joi.number().required(),
  facebook: Joi.boolean().required(),
  instagram: Joi.boolean().required(),
  twitter: Joi.boolean().required(),
});

module.exports.get = Joi.object({
  page: Joi.string().required(),
  limit: Joi.string().required(),
});

module.exports.patch = Joi.object({
  userId: Joi.number().required(),
  facebook: Joi.boolean().required(),
  instagram: Joi.boolean().required(),
  twitter: Joi.boolean().required(),
});

module.exports.delete = Joi.object({
  id: Joi.string().required(),
});
