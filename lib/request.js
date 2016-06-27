"use strict"

let fs = require('fs'),
    qs = require('qs'),
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

        let parsed = Object.assign(
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

        } else if (parsed.form) {

            this._applyTransforms('form', parsed);

        } else if (parsed.formData) {

            this._applyTransforms('formData', parsed);

            parsed.formData = this._getMultipartData(parsed.formData);
        }

        this._clean(parsed);
        
        return parsed;
    }

    _clean(config) {
        delete config.transforms;
        delete config.protocol;
        delete config.env;
        delete config.endpoint;
    }

    _getUri(parsed) {
        return parsed.protocol + '://'
            + parsed.env + '/'
            + (parsed.endpoint ? parsed.endpoint : '');

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

    _getMultipartData(formData) {

        return Object.keys(formData).reduce((form, prop) => {

            let data = helpers.isFilePath(formData[prop]) ?
                fs.createReadStream(helpers.getConfigFilePath() + formData[prop]) :
                formData[prop];

            form[prop] = data;

            return form;

        }, {});

    }
}

module.exports = Request;
