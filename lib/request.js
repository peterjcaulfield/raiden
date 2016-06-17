"use strict"

var fs = require('fs'),
    qs = require('qs'),
    helpers = require('./helpers'),
    FormData = require('form-data'),
    transformer = require('./transformer');


class Request {

    constructor(requestKey, config, userArgs) {

        this.start;

        this.end;

        this.rawConfig = Object.assign(config,
                                       helpers.cloneWithDefinedProps(userArgs));

        this.requestKey = requestKey;

        this.url =  this._getUrl();

        this.config = this._parseConfig();
    }

    getExecutionTime() {
        return `${this.end[0]}s:${Math.round(this.end[1]/1000000)}ms`;
    }

    _parseConfig() {
        var c = {};
        c.method = this.rawConfig.method;
        c.body = this._getBody();
        c.headers = this._getHeaders(c.body);
        return c;
    }

    _getUrl() {
        return this.rawConfig.protocol + '//'
            + this.rawConfig.env + '/';
            + this.rawConfig.endpoint ? this.rawConfig.endpoint : ''
            + this.rawConfig.query ? '?' + this.rawConfig.query : '';
    }

    _applyTransforms() {

        if (this.rawConfig.transforms instanceof Array) {

            this.rawConfig.transforms.forEach((t) => {

                helpers.setPropViaPath(
                    this.rawConfig.body,
                    transformer(t.transform),
                    t.key
                );

            });
        }

    }

    _getBody() {

        this._applyTransforms();

        //var contentType = helpers.getPropSafely(this.rawConfig.headers, 'content-type', '');
        var contentType = this.rawConfig.headers['content-type'];

        if (contentType === 'application/json') {

            return this._getJsonBody();

        } else if (contentType === 'application/x-www-form-urlencoded') {

            return this._getUrlEncodedBody();

        } else if (contentType === 'multipart/form-data') {

            return this._getMultipartBody();

        } else if (typeof this.rawConfig.body === 'object') {
            //TODO create error constants
            console.log(`[Error] \"${this.requestKey}\" request: A 'content-type' header is required if request body is an object:`);
            console.log(`${JSON.stringify(this.rawConfig, null, 4)}`);
            process.exit(1);
        }

        return this.rawConfig.body;
    }

    _getUrlEncodedBody() {
        return qs.stringify(this.rawConfig.body);
    }

    _getJsonBody() {
        return JSON.stringify(this.rawConfig.body);
    }

    _getMultipartBody() {

        return Object.keys(this.rawConfig.body).reduce((form, prop) => {

            var append = helpers.isFilePath(this.rawConfig.body[prop]) ?
                fs.createReadStream(helpers.getAbsoluteFilePath(this.rawConfig.body[prop])) :
                this.rawConfig.body[prop];

            form.append(prop, append);

            return form;

        }, new FormData());

    }

    _getHeaders(processedBody) {

        var contentHeaders;

        if (processedBody !== '') {
            if (processedBody instanceof FormData) {
                contentHeaders = processedBody.getHeaders();
            } else {
                contentHeaders = { 'Content-Length': Buffer.byteLength(processedBody) };
            }
        }

        return Object.assign(this.rawConfig.headers, contentHeaders || {});
    }
}

module.exports = Request;
