var config = require('../config').getConfig();

module.exports = {
    exec: (program) => {
        var configValue = program.envs ? config.envs : config.requests;
        Object.keys(configValue).sort().forEach(function(item){
            console.log(item);
        });
    }
}
