const schemas = require('./schemas'),
      Config = require('./config'),
      RaidenConfig = require('./raidenConfig');

const raidenConfig = new RaidenConfig('config.yml');

const envs = new Config(
    'envs.yml',
    schemas.envsSanitizeSchema,
    schemas.envsValidationSchema
);

const requests = new Config(
    raidenConfig.get('reqfile') || 'requests.yml',
    schemas.requestSanitizeSchema,
    schemas.requestValidationSchema
);

const userConfigs = {
    envs,
    requests
};

module.exports = userConfigs;
