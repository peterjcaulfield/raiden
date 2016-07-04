const requestValidationSchema = require('./requestValidaton'),
      requestSanitizeSchema = require('./requestSanitize'),
      envsValidationSchema = require('./envsValidation'),
      envsSanitizeSchema = require('./envsSanitize'),
      raidenConfigValidation = require('./raidenConfigValidation');

module.exports = {
    requestValidationSchema,
    requestSanitizeSchema,
    envsValidationSchema,
    envsSanitizeSchema,
    raidenConfigValidation
}
