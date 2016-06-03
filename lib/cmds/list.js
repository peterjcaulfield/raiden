var config = require('../config').getConfig(),

module.exports = {
    exec: (flag) => {
        var configValue = flag === 'envs' ? config.envs : config.requests;
        Object.keys(configValue).sort().forEach(function(item){
            console.log(item);
        });
    }
}
