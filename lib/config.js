var yaml = require('js-yaml'),
    fs   = require('fs'),
    inspector = require('schema-inspector'),
    requestValidationSchema = require('./schemas/requestValidaton'),
    requestSanitizeSchema = require('./schemas/requestSanitize'),
    envsValidationSchema = require('./schemas/envsValidation'),
    envsSanitizeSchema = require('./schemas/envsSanitize');

function sanitizeEnvs(config, schema) {
    return inspector.sanitize(schema, config).data;
}

function validateConfig(config, schema) {

    var invalidConfigs = {};

    Object.keys(config).forEach((key) => {
        var result = inspector.validate(schema, config[key]);
        if (!result.valid) invalidConfigs[key] = result;
    });

    if (Object.keys(invalidConfigs).length) {
        Object.keys(invalidConfigs).forEach((configKey) => {
            console.log(`[Error] \"${configKey}\" config is invalid:`);
            console.log(invalidConfigs[configKey].format());
        });
        process.exit(1);
    }
}

function sanitizeRequests(config, schema) {

    var sanitizedConfig = {};

    Object.keys(config).forEach((key) => {
        sanitizedConfig[key] = inspector.sanitize(schema, config[key]).data;
    });

    return sanitizedConfig;
}

function getConfig() {

    var config;

    try {

        var envs = sanitizeEnvs(
            yaml.safeLoad(fs.readFileSync(`${process.env.HOME}/.axp/envs.yml`, 'utf8')) || {},
            envsSanitizeSchema
        ),
        requests = sanitizeRequests(
            yaml.safeLoad(fs.readFileSync(`${process.env.HOME}/.axp/requests.yml`, 'utf8')),
            requestSanitizeSchema
        );

        validateConfig(envs, envsValidationSchema);
        validateConfig(requests, requestValidationSchema);

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
