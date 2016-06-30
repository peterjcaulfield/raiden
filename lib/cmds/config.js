const helpers = require('../helpers'),
      fs = require('fs'),
      yaml = require('js-yaml'),
      inspector = require('schema-inspector'),
      validationSchema = require('../schemas/raidenConfigValidation');

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

        if (this._program.list === 'requests' || this._program.list === 'envs') {

            // only require the user configs when we need them as there may be a bad filepath for reqfile
            // that will cause avoidable crashes :)
            const config = require('../config');

            Object.keys(config[this._program.list]).sort().forEach((item) => {
                console.log(item);
            });
        
        } else {

            Object.keys(this._raidenConfig).sort().forEach((key) => {
                console.log(`${key}:${this._raidenConfig[key]}`);
            });

        }
     
    }

    _validateRaidenConfigUpdate(update) {
        return inspector.validate(validationSchema, update);   
    }

    _updateRaidenConfig(key, value) {

        const update = {};

        update[key] = value;

        const validation = this._validateRaidenConfigUpdate(update);

        if (!validation.valid) {
            console.error(`[Error] invalid value given for ${key}`);
            console.error(`[Error] ${validation.format()}`);
            return;
        }

        this._raidenConfig = Object.assign({}, this._raidenConfig, update);

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

        return yaml.safeLoad(data) || {};
    }

}

module.exports = ConfigCmd;
