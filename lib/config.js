var yaml = require('js-yaml'),
    fs   = require('fs');
//TODO lower case the keys that should be lower cased 
module.exports = {
    getConfig: () => {
        var config;
        try {
            var envs = yaml.safeLoad(fs.readFileSync(`${process.env.HOME}/.axp/envs.yml`, 'utf8')),
                requests = yaml.safeLoad(fs.readFileSync(`${process.env.HOME}/.axp/requests.yml`, 'utf8'));
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
}
