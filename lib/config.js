const path = require('path'),
      fs = require('fs'),
      yaml = require('js-yaml'),
      inspector = require('schema-inspector');

class Config {

    constructor(filename, sanitizeSchema=null, validateSchema=null) {

        this._filePath = path.join(process.env.HOME, '.raiden', filename);

        this._sanitizeSchema = sanitizeSchema;

        this._validateSchema = validateSchema;

        this._config = this._load();

        this._sanitize()._validate();
    }

    get(key) {

        if (key) return this._config[key];

        return this._config;

    }

    _sanitize() {

        if (this._sanitizeSchema) {

            Object.keys(this._config).forEach((key) => {
                this._config[key] = inspector.sanitize(this._sanitizeSchema, this._config[key]).data;
            });

        }

        return this;
    }

    _validate() {

        if (this._validateSchema) {

            Object.keys(this._config).forEach((key) => {

                let validation = inspector.validate(this._validateSchema, this._config[key]);

                if (!validation.valid) {

                    this._config[key] = {
                        error: validation.format()
                    };

                }

            });
        }
    }

    _load() {

        let config;

        try {

            config = yaml.safeLoad(
                fs.readFileSync(
                    this._filePath,
                    'utf8'
                )
            );

        } catch(e) {
            console.error(`${e.name}: ${e.message}`);
            process.exit(1);
        }

        return config || {};
    }

}

module.exports = Config;
