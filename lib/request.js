"use strict"

var fs = require('fs'),
    qs = require('qs'),
    helpers = require('./helpers'),
    chalk = require('chalk'),
    FormData = require('form-data');


class Request {

    constructor(requestKey, config, userArgs) {

        this.start;

        this.end;

        this._defaults = {
            protocol: 'http:',
            method: 'GET',
            endpoint: '',
            query: '',
            headers: {},
            body: '',
            env: '127.0.0.1'
        };

        this.rawConfig = config;

        this.sanitizedConfig = Object.assign(this._defaults,
                                      helpers.cloneWithDefinedProps(config),
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
        c.method = this.sanitizedConfig.method;
        c.body = this._getBody();
        c.headers = this._getHeaders(c.body);
        return c;
    }

    _getUrl() {
        return this.sanitizedConfig.protocol + '//'
            + this.sanitizedConfig.env + '/';
            + this.sanitizedConfig.endpoint ? this.sanitizedConfig.endpoint : ''
            + this.sanitizedConfig.query ? '?' + this.sanitizedConfig.query : '';
    }

    _getBody() {

        var contentType = helpers.getPropSafely(this.sanitizedConfig.headers, 'content-type', ''),
            body = this.sanitizedConfig.body;

        if (contentType === 'application/json') {

            body = JSON.stringify(this.sanitizedConfig.body);

        } else if (contentType === 'application/x-www-form-urlencoded') {

            body = qs.stringify(this.sanitizedConfig.body);

        } else if (contentType === 'multipart/form-data') {

            body = Object.keys(this.sanitizedConfig.body).reduce((form, prop) => {

                var append = helpers.isFilePath(this.sanitizedConfig.body[prop]) ?
                    fs.createReadStream(helpers.getAbsoluteFilePath(this.sanitizedConfig.body[prop])) :
                    this.sanitizedConfig.body[prop];

                form.append(prop, append);

                return form;

            }, new FormData());

        } else if (typeof this.sanitizedConfig.body === 'object') {
            //TODO create error constants
            console.log(`[Error] \"${this.requestKey}\" request: A 'content-type' header is required if request body is an object:`);
            console.log(`${JSON.stringify(this.sanitizedConfig, null, 4)}`);
            process.exit(1);
        }

        return body;
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

        return Object.assign(this.sanitizedConfig.headers, contentHeaders || {});
    }
}

module.exports = Request;
