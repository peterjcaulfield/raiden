const helpers = require('../helpers'),
      fs = require('fs'),
      yaml = require('js-yaml'),
      inspector = require('schema-inspector'),
      path = require('path');

class ConfigCmd {

    constructor(program) {
        this._program = program;
    }

    exec() {

        if (this._program.list) {

            this._list();

        } else if (this._program.set) {

            this._updateRaidenConfig(this._program.set, this._program.args[0]);

        }

    }

    _list() {

        if (this._program.list === 'requests' || this._program.list === 'envs') {

            // only require the user configs when we need them as there may be a bad filepath for reqfile
            // that will cause avoidable crashes :)
            const userConfigs = require('../userConfigs');

            Object.keys(userConfigs[this._program.list].get()).sort().forEach((item) => {
                console.log(item);
            });

        } else {

            const RaidenConfig = require('../raidenConfig'),
                  raidenConfig = new RaidenConfig('config.yml');

            Object.keys(raidenConfig.get()).sort().forEach((key) => {
                console.log(`${key}:${raidenConfig.get(key)}`);
            });

        }

    }

    _updateRaidenConfig(key, value) {

        const data = {},
              RaidenConfig = require('../raidenConfig'),
              raidenConfig = new RaidenConfig('config.yml');

        data[key] = value;

        raidenConfig.update(data);

    }

}

module.exports = ConfigCmd;
