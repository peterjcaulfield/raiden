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
      this.program = program;
      this.config = config;
      this.queue = [];
      this.stats = {
        statusCodes: {},
      };
  }

  exec() {
      this.queue = this._createRequestQueue();
      this._executeRequests().then(() => {
          if (this.program.info) {
            console.log(chalk.white.underline('stats:'));
            console.log(JSON.stringify(this.stats, null, 4));
          }
      });
  }

  _createRequestQueue() {
      var env = this.config.envs[this.program.env] || this.config.envs.default;
      return this.program.args.reduce((queue, curr) => {
          if (!this.config.requests[curr]) {
              console.log(`[info] request \"${curr}\" not found in requests.yml. Skipping.`);
              return queue;
          };
          queue.push(new Request(curr, this.config.requests[curr], { env: env, query: this.program.query }));
          return queue;
      }, []);
  }

  _executeRequests() {
      if  (this.program.async) {
          return this._executeRequestsAsync();
      } else {
          return this._executeRequestsSync();
      }
  }

  _executeRequestsSync() {
      return this.queue.reduce((sequence, request) => {
          return sequence.then(() => {
              return fetch(request.url, request.config);
          }).then((resp) =>{
              return this._processResponse({ url: request.url, headers: request.config.headers, body: request.config.body }, resp);
          }).catch((e) =>{
              console.log(e);
          });
      }, Promise.resolve());
  }

  _executeRequestsAsync() {

      var requestPromises = [];

      this.queue.reduce((requests, request) => {
          var requestPromise = fetch(request.url, request.config)
              .then((resp) => this._processResponse({ url: request.url, headers: request.config.headers, body: request.config.body }, resp))
              .catch((e) => console.log(e));

          requestPromises.push(requestPromise);
      }, requestPromises);

      return Promise.all(requestPromises);
  }

  _processResponse(request, resp) {

      this._updateStats(resp.status);

      if (resp.headers.get('content-type') === 'application/json') {
          return resp.json().then((json) => {
              printer.print(this.program, request, resp, json);
          });
      }
      return resp.text().then((text) => {
          printer.print(this.program, request, resp, text);
      });
  }

  _updateStats(status) {
    this.stats.statusCodes[status] ? this.stats.statusCodes[status]++ :
        this.stats.statusCodes[status] = 1;
  }
}

module.exports = RequestCommand;
