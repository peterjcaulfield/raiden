"use strict";

const config = require('../config'),
      Request = require('../request'),
      helpers = require('../helpers'),
      RequestPrinter = require('../requestPrinter'),
      rp = require('request-promise'),
      CookieFilestore = require('../cookieFilestore'),
      Promise = require('bluebird'),
      inspector = require('schema-inspector'),
      validationSchema = require('../schemas').requestValidationSchema;

class RequestCommand {

    constructor(program) {
        this._program = program;
        this._queue = [];
        this._jar = rp.jar(new CookieFilestore());
    }

    exec() {

        this._queue = this._createRequestQueue();

        return this._executeRequests();
    }

    _validateRequest(request) {
        return inspector.validate(validationSchema, request);
    }

    _createRequestQueue() {

        const env = config.envs[this._program.env || 'default'] || config.envs.default;

        return this._program.args.reduce((queue, curr) => {

            let request = config.requests[curr];
            
            if (!request) {
                
                console.log(`[info] request \"${curr}\" not found in config. Skipping.`);

                return queue;
            };

            let validation = this._validateRequest(request);

            if (!validation.valid) {

                console.error(`[Error] \"${curr}\" request config is invalid:`);
                console.error(`[Error] ${validation.format()}. Skipping.`);

                return queue;
            }

            queue.push(
                new Request(
                curr,
                request,
                { env: env, qs: this._program.query })
            );

            return queue;

        }, []);
    }

    _executeRequests() {
        if  (this._program.async) {
            return this._executeRequestsAsync();
        } else {
            return this._executeRequestsSync();
        }
    }

    _executeRequestsSync() {

        return this._queue.reduce((sequence, request) => {

            return sequence.then(() => {

                request.start = process.hrtime();

                return rp(Object.assign({ jar: this._jar }, request.config));

            }).then((resp) => {

                request.end = process.hrtime(request.start);

                return this._processResponse(request, resp);

            }).catch((e) => console.error(e));

        }, Promise.resolve());
    }

    _executeRequestsAsync() {

        const requestPromises = [];

        this._queue.reduce((requests, request) => {

            request.start = process.hrtime();

            let requestPromise = rp(Object.assign({ jar: this._jar }, request.config))
                .then((resp) => {

                    request.end = process.hrtime(request.start);

                    this._processResponse(request, resp);

                }).catch((e) => console.error(e));

            requestPromises.push(requestPromise);

        }, requestPromises);

        return Promise.all(requestPromises);
    }

    _processResponse(request, resp) {
        RequestPrinter.print(this._program, request, resp);
        return Promise.resolve();
    }
}

module.exports = RequestCommand;
