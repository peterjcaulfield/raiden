var yaml = require('js-yaml'),
    fs   = require('fs'),
    inspector = require('schema-inspector'),
    requestValidationSchema = require('./schemas/requestValidaton'),
    requestSanitizeSchema = require('./schemas/requestSanitize');

function sanitizeRequests(config, schema) {

    var sanitizedConfig = {};

    Object.keys(config).forEach((key) => {
        sanitizedConfig[key] = inspector.sanitize(schema, config[key]).data;
    });

    return sanitizedConfig;
}

function validateRequestsConfig(config, schema) {

    var invalidRequests = {};

    Object.keys(config).forEach((key) => {
        var result = inspector.validate(schema, config[key]);
        if (!result.valid) invalidRequests[key] = result;
    });

    if (Object.keys(invalidRequests).length) {
        Object.keys(invalidRequests).forEach((requestKey) => {
            console.log(`[Error] Request \"${requestKey}\" config is invalid:`);
            console.log(invalidRequests[requestKey].format());
        });
        process.exit(1);
    }
}

function getConfig() {

    var config;

    try {
        var envs = yaml.safeLoad(fs.readFileSync(`${process.env.HOME}/.axp/envs.yml`, 'utf8')),
            requests = yaml.safeLoad(fs.readFileSync(`${process.env.HOME}/.axp/requests.yml`, 'utf8'));

        requests = sanitizeRequests(requests, requestSanitizeSchema);
        validateRequestsConfig(requests, requestValidationSchema);

        config = {
            envs,
            requests
        };
    } catch (e) {
        console.log(e);
        process.exit(1);
    }

    return config;
}

module.exports = getConfig();
