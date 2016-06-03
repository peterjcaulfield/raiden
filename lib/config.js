var yaml = require('js-yaml'),
    fs   = require('fs');

module.exports = {
    getConfig: () => {
        var config;
        try {
            var envs = yaml.safeLoad(fs.readFileSync(`${process.env.HOME}/.axp/envs.yml`, 'utf8'));
            var requests = yaml.safeLoad(fs.readFileSync(`${process.env.HOME}/.axp/requests.yml`, 'utf8'));
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
