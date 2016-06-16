var requestValidationSchema = require('./requestValidaton'),
    requestSanitizeSchema = require('./requestSanitize'),
    envsValidationSchema = require('./envsValidation'),
    envsSanitizeSchema = require('./envsSanitize');

module.exports = {
    requestValidationSchema,
    requestSanitizeSchema,
    envsValidationSchema,
    envsSanitizeSchema
}
