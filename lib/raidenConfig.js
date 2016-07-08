const Config = require('./config'),
      fs = require('fs'),
      yaml = require('js-yaml');

class RaidenConfig extends Config {

    update(data) {

        this._config = Object.assign({}, this._config, data);

        this._save();

    }

    _save() {

        fs.writeFileSync(this._filePath, yaml.safeDump(this._config));

    }

}

module.exports = RaidenConfig;
