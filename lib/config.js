const yaml = require('js-yaml'),
      fs   = require('fs'),
      inspector = require('schema-inspector'),
      schemas = require('./schemas');

function sanitizeEnvs(config, schema) {
    return inspector.sanitize(schema, config).data;
}

function sanitizeRequests(config, schema) {

    const sanitizedConfig = {};

    Object.keys(config).forEach((key) => {
        sanitizedConfig[key] = inspector.sanitize(schema, config[key]).data;
    });

    return sanitizedConfig;
}

function validateConfig(config, schema) {

    const invalidConfigs = {};

    Object.keys(config).forEach((key) => {
        let result = inspector.validate(schema, config[key]);
        if (!result.valid) invalidConfigs[key] = result;
    });

    if (Object.keys(invalidConfigs).length) {
        Object.keys(invalidConfigs).forEach((configKey) => {
            console.error(`[Error] \"${configKey}\" config is invalid:`);
            console.error(invalidConfigs[configKey].format());
        });
        process.exit(1);
    }
}

function getConfig() {

    let config;

    try {

        const envs = sanitizeEnvs(
            yaml.safeLoad(fs.readFileSync(`${process.env.HOME}/.axp/envs.yml`, 'utf8')),
            schemas.envsSanitizeSchema
        ),
        requests = sanitizeRequests(
            yaml.safeLoad(fs.readFileSync(`${process.env.HOME}/.axp/requests.yml`, 'utf8')),
            schemas.requestSanitizeSchema
        );

        validateConfig(envs, schemas.envsValidationSchema);
        validateConfig(requests, schemas.requestValidationSchema);

        config = {
            envs,
            requests
        };

    } catch (e) {
        console.error(e);
        process.exit(1);
    }

    return config;
}

module.exports = getConfig();
