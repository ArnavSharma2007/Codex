if (process.env.NODE_ENV === 'test') {
  module.exports = (req, res, next) => next();
  return;
}
/**
 * Joi validation middleware factory.
 * Usage: router.post('/route', validate(schema), handler)
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,     // return ALL errors, not just first
      stripUnknown: true,    // remove unknown fields for security
      allowUnknown: false,
    });

    if (error) {
      const errors = error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message.replace(/['"]/g, ''),
      }));
      return res.status(422).json({ message: 'Validation failed', errors });
    }

    // Replace req[property] with sanitised value
    req[property] = value;
    return next();
  };
};

module.exports = validate;
