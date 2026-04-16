const Joi = require('joi');

const passwordRules = Joi.string()
  .min(8)
  .max(64)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  .messages({
    'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    'string.min': 'Password must be at least 8 characters',
  });

const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(80).required(),
  email: Joi.string().email().lowercase().trim().required(),
  password: passwordRules.required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().required(),
});

const setPremiumSchema = Joi.object({
  email: Joi.string().email().required(),
  adminKey: Joi.string().required(),
});

module.exports = { registerSchema, loginSchema, setPremiumSchema };
