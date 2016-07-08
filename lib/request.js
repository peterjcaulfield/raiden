const fs = require('fs'),
      qs = require('qs'),
      path = require('path'),
      helpers = require('./helpers'),
      transformer = require('./transformer');

class Request {

    constructor(requestKey, config, userArgs) {

        this.start;

        this.end;

        this.rawConfig = Object.assign(config,
                                       helpers.cloneWithDefinedProps(userArgs));

        this.requestKey = requestKey;

        this.config = this._parseConfig();
    }

    getExecutionTime() {
        return `${this.end[0]}s:${Math.round(this.end[1]/1000000)}ms`;
    }

    _parseConfig() {

        const parsed = Object.assign(
            {},
            this.rawConfig,
            { resolveWithFullResponse: true, simple: false }
        );


        parsed.uri = this._getUri(parsed);

        if (parsed.qs && typeof parsed.qs === 'string') {
            parsed.qs = qs.parse(parsed.qs);
        }

        if (parsed.body) {

            this._applyTransforms('body', parsed);
            this._updateRequestWithUserData('body', parsed);

        } else if (parsed.form) {

            this._applyTransforms('form', parsed);
            this._updateRequestWithUserData('form', parsed);

        } else if (parsed.formData) {

            this._applyTransforms('formData', parsed);
            this._updateRequestWithUserData('formData', parsed);

            parsed.formData = this._convertFilepathToValue(parsed.formData, 'createReadStream');
        }

        if (parsed.agentOptions) {
          parsed.agentOptions = this._convertFilepathToValue(parsed.agentOptions, 'readFileSync');
        }

        this._clean(parsed);

        return parsed;
    }

    _clean(config) {
        delete config.transforms;
        delete config.protocol;
        delete config.env;
        delete config.endpoint;
        delete config.data;
    }

    _updateRequestWithUserData(key, config) {
        //TODO allow multiple key vals delimited by sumfink
        if (config.data) {

            const mutations = config.data.split(',');

            const keyVals = mutations.reduce((parsed, mutation) => {

                parsed.push(mutation.split('='));

                return parsed;

            }, []);

            keyVals.forEach((kv) => {
                helpers.setPropViaPath(config[key], kv[1],  kv[0]);
            });
        }
    }

    _getUri(parsed) {
        return parsed.protocol + '://' +
               parsed.env + '/' +
               (parsed.endpoint ? parsed.endpoint : '');
    }

    _applyTransforms(key, obj) {

        if (obj.transforms instanceof Array) {

            obj.transforms.forEach((t) => {

                helpers.setPropViaPath(
                    obj[key],
                    transformer(t.transform),
                    t.key
                );

            });
        }

    }

    _convertFilepathToValue(obj, method) {

        return Object.keys(obj).reduce((updated, prop) => {

            let data = obj[prop];

            if (helpers.isFilePath(data)) {
                // we have an absolute path so don't modify
                if (data[0] === '/') {

                    data = fs[method](data);

                } else {

                    data = fs[method](path.join(process.env.HOME, '.raiden', data));

                }
            }

            updated[prop] = data;

            return updated;

        }, {});

    }
}

module.exports = Request;
