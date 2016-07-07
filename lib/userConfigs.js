const schemas = require('./schemas'),
      Config = require('./config'),
      RaidenConfig = require('./raidenConfig');


const raidenConfig = new RaidenConfig('config.yml');

const envs = new Config(
    'envs.yml',
    schemas.envsSanitize,
    schemas.envsValidation
);

const requests = new Config(
    raidenConfig.get('reqfile') || 'requests.yml',
    schemas.requestsSanitize,
    schemas.requestsValidate
);

const userConfigs = {
    envs,
    requests
};

module.exports = userConfigs;
