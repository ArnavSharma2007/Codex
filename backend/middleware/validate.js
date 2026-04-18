const Joi = require('joi');

const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      allowUnknown: true
    });

    if (error) {
      return res.status(422).json({
        errors: error.details.map(d => ({
          message: d.message
        }))
      });
    }

    req[property] = value;
    next();
  };
};

module.exports = validate;
