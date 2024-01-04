const Joi = require('joi');

module.exports.create = Joi.object({
  name: Joi.string().min(5).max(15).required(),
  status: Joi.boolean().required(),
});

module.exports.get = Joi.object({
  id: Joi.string().min(1).max(1000).required(),
});

module.exports.update = Joi.object({
  name: Joi.string().min(5).max(15).required(),
  status: Joi.boolean().required(),
});

module.exports.delete = Joi.object({
  id: Joi.string().min(1).max(1000).required(),
});
