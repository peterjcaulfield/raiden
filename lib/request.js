"use strict"

let fs = require('fs'),
    qs = require('qs'),
    helpers = require('./helpers'),
    FormData = require('form-data'),
    transformer = require('./transformer'),
    tough = require('tough-cookie'),
    CookieFilestore = require('./cookieFilestore');



class Request {

    constructor(requestKey, config, userArgs) {

        this._cookieJar = new tough.CookieJar(new CookieFilestore());

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

        let c = {
            resolveWithFullResponse: true,
            simple: false
        };

        c.uri = this._getUri();

        if (this.rawConfig.query) {
            c.qs = this.rawConfig.query;
        }

        c.method = this.rawConfig.method;

        if (this.rawConfig.body) {

            this._applyTransforms('body');

            c.body = this.rawConfig.body;

            if (this.rawConfig.headers['content-type'] === 'application/json') {
                c.json = true;
            }

        } else if (this.rawConfig.form) {

            this._applyTransforms('form');

            if (this.rawConfig.headers['content-type'] === 'multipart/form-data') {
                c.formData = this._getMultipartData();
            } else {
                c.form = this.rawConfig.form;
            }

        }

        c.headers = this._getHeaders(c.body);

        return c;
    }

    _getUri() {
        return this.rawConfig.protocol + '://'
            + this.rawConfig.env + '/'
            + (this.rawConfig.endpoint ? this.rawConfig.endpoint : '');
    }

    _applyTransforms(key) {

        if (this.rawConfig.transforms instanceof Array) {

            this.rawConfig.transforms.forEach((t) => {

                helpers.setPropViaPath(
                    this.rawConfig[key],
                    transformer(t.transform),
                    t.key
                );

            });
        }

    }

    _getMultipartData() {

        return Object.keys(this.rawConfig.form).reduce((form, prop) => {

            let data = helpers.isFilePath(this.rawConfig.form[prop]) ?
                fs.createReadStream(helpers.getConfigFilePath() + this.rawConfig.form[prop]) :
                this.rawConfig.form[prop];

            form[prop] = data;

            return form;

        }, {});

    }

    _getHeaders() {
        return this.rawConfig.headers;
    }
}

module.exports = Request;
