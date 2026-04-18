const Joi = require('joi');

// ✅ Simple, test-friendly schemas
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),

  email: Joi.string()
    .email({ tlds: { allow: false } }) // <-- Disables strict TLD checking for tests
    .required(),

  password: Joi.string()
    .min(8)
    .required()
});

const loginSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } }) // <-- Disables strict TLD checking for tests
    .required(),

  password: Joi.string()
    .min(1)
    .required()
});

const setPremiumSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required(),

  adminKey: Joi.string()
    .required()
});

module.exports = {
  registerSchema,
  loginSchema,
  setPremiumSchema
};
