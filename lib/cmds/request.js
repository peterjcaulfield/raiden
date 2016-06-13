"use strict";

var helpers = require('../helpers'),
    Request = require('../request'),
    printer = require('../printer'),
    fetch = require('node-fetch'),
    chalk = require('chalk'),
    qs = require('qs'),
    fs = require('fs'),
    FormData = require('form-data'),
    Promise = require('es6-promise').Promise;

//TODO handle case sensitivity in yml keys
//TODO handle missing yml keys/values
//TODO pass in config as arg to exec from commmand?
class RequestCommand {

  constructor(program, config) {
      this._program = program;
      this._config = config;
      this._queue = [];
      this._stats = {
        totalRequests: 0,
        statusCodes: {},
      };
  }

  exec() {

      this._queue = this._createRequestQueue();

      this._executeRequests().then(() => {

          if (this._program.info) {
            console.log(chalk.white.underline('stats:'));
            console.log(JSON.stringify(this._stats, null, 4));
          }

      });
  }

  _createRequestQueue() {

      var env = this._config.envs[this._program.env] || this._config.envs.default;

      return this._program.args.reduce((queue, curr) => {

          if (!this._config.requests[curr]) {
              console.log(`[info] request \"${curr}\" not found in requests.yml. Skipping.`);
              return queue;
          };

          queue.push(
            new Request(
              curr,
              this._config.requests[curr],
              { env: env, query: this._program.query })
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

              return fetch(request.url, request.config);

          }).then((resp) => {

              request.end = process.hrtime(request.start);

              return this._processResponse(request, resp);

          }).catch((e) => console.log(e));

      }, Promise.resolve());
  }

  _executeRequestsAsync() {

      var requestPromises = [];

      this._queue.reduce((requests, request) => {

          var requestPromise = fetch(request.url, request.config)
              .then((resp) => {

                  this._processResponse(request, resp);

              }).catch((e) => console.log(e));

          requestPromises.push(requestPromise);

      }, requestPromises);

      return Promise.all(requestPromises);
  }

  _processResponse(request, resp) {

      if (resp.headers.get('content-type') === 'application/json') {
          return resp.json().then((json) => {
              this._updateStats(resp.status, request.requestKey);
              printer.printRequestInfo(this._program, request, resp, json);
          });
      }
      return resp.text().then((text) => {
          this._updateStats(resp.status, request.requestKey);
          printer.printRequestInfo(this._program, request, resp, text);
      });
  }

  _updateStats(status, request) {}
}

module.exports = RequestCommand;
