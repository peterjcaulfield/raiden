var fs = require('fs'), 
    qs = require('qs'),
    helpers = require('./helpers'),
    FormData = require('form-data');

class Request {

    constructor(requestKey, config, userArgs) {

        var defaults = {
            protocol: 'http:',
            method: 'GET',
            endpoint: '',
            query: '',
            headers: {},
            body: '',
            env: '127.0.0.1'
        };

        var sanitized = Object.assign(defaults, 
                                      helpers.cloneWithDefinedProps(config), 
                                      helpers.cloneWithDefinedProps(userArgs));

        this.url =  this._getUrl(sanitized.protocol, 
                                 sanitized.env, 
                                 sanitized.endpoint, 
                                 sanitized.query);

        this.config = this._parseConfig(sanitized, requestKey);
    }

    _parseConfig(config, requestKey) {
        var c = {};
        c.method = config.method;
        c.body = this._getBody(requestKey, config.headers, config.body);
        c.headers = this._getHeaders(config, c.body);
        return c;
    }

    _getUrl(protocol, env, endpoint, query) {
        return `${protocol}//${env}/${endpoint ? endpoint : ''}${query ? '?' + query : ''}`
    }

    _getBody(requestKey, headers, body) {

        var contentType = helpers.getPropSafely(headers, 'content-type', '').toLowerCase();

        if (contentType === 'application/json') {
            body = JSON.stringify(body);
        } else if (contentType === 'application/x-www-form-urlencoded') {
            body = qs.stringify(body);
        } else if (contentType === 'multipart/form-data') {
            body = Object.keys(body).reduce((form, prop) => {

                var append = helpers.isFilePath(body[prop]) ? 
                    fs.createReadStream(helpers.getAbsoluteFilePath(body[prop])) : 
                    body[prop];

                form.append(prop, append);

                return form;
            }, new FormData());
        } else if (typeof body === 'object') {
            //TODO create error constants
            console.log(chalk.bold.red(`Error in \"${requestKey}\" request: A content-type header is required if request body is an object:`));
            console.log(chalk.red(`${JSON.stringify(r, null, 4)}`));
            process.exit(1);
        }

        return body;
    }

    _getHeaders(config, body) {

        var contentHeaders;
        
        if (body !== '') {
            if (body instanceof FormData) {
                contentHeaders = body.getHeaders();
            } else {
                contentHeaders = { 'Content-Length': Buffer.byteLength(body) };
            }
        } 

        return Object.assign(config.headers, contentHeaders || {});
    }
}

module.exports = Request;
