const helpers = require('../helpers'),
      fs = require('fs'),
      yaml = require('js-yaml');

class ConfigCmd {
    
    constructor(program) {

        this.filePath = `${helpers.getConfigFilePath()}config.yml`;
        
        this._program = program; 

        this._raidenConfig = this._loadRaidenConfig();
    }
    exec() {

        if (this._program.list) {
            
            this._list()

        } else if (this._program.set) {            

            this._updateRaidenConfig(this._program.set, this._program.args[0]);

        }

    }

    _list() {
        // require config in the _list method so that we can update raiden config without issues
        // e.g if the reqfile doesn't exist 
        const config = require('../config'),
              configValue = this._program.list === 'envs' ? config.envs : config.requests;

        Object.keys(configValue).sort().forEach((item) => {
            console.log(item);
        });
     
    }

    _updateRaidenConfig(key, value) {

        const update = {};

        update[key] = value;

        this._raidenConfig = Object.assign({}, this._config, update);

        this._saveToDisk();
    }

    _saveToDisk() {
        fs.writeFileSync(this.filePath, yaml.safeDump(this._raidenConfig));
    }

    _loadRaidenConfig() {

        let data;

        try {

            data = fs.readFileSync(this.filePath);

        } catch(e) {

            return {};

        }

        return yaml.safeLoad(data);
    }

}

module.exports = ConfigCmd;