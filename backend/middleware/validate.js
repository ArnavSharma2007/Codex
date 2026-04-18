const Joi = require('joi');

const validate = (schema, property = 'body') => {
  return (req, res, next) => {

    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      allowUnknown: true
    });

    if (error) {
      return res.status(422).json({
        message: error.details.map(d => d.message).join(', ')
      });
    }

    req[property] = value;
    next();
  };
};

module.exports = validate;
