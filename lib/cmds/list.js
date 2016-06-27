const config = require('../config');

module.exports = {
    exec: (program) => {
        const configValue = program.envs ? config.envs : config.requests;
        Object.keys(configValue).sort().forEach((item) => {
            console.log(item);
        });
    }
};
