var config = require('../config').getConfig(),
    helpers = require('../helpers'),
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
module.exports = {
    exec: (program) => {
        var requestsQueue = createRequestQueue(program, config);
        console.log(requestsQueue);
        executeRequests(program, requestsQueue).then(() => console.log('donezo'));
    }
}

function executeRequests(program, queue) {
    if  (program.async) {
        return executeRequestsAsync(program, queue);
    } else {
        return executeRequestsSync(program, queue);
    }
}

function executeRequestsSync(program, queue) {
    return queue.reduce((sequence, request) => {
        return sequence.then(() => {
            return fetch(request.url, request.config);
        }).then((resp) =>{
            return processResponse(program, resp);
        }).catch((e) =>{
            console.log(e);
        });
    }, Promise.resolve());
}

function executeRequestsAsync(program, queue) {

    var requestPromises = [];

    queue.reduce((requests, request) => {
        var requestPromise = fetch(request.url, request.config)
            .then((resp) => processResponse(program, resp))
            .catch((e) => console.log(e));

        requestPromises.push(requestPromise);
    }, requestPromises);

    return Promise.all(requestPromises);
}

function createRequestQueue(program, config) {
    var env = config.envs[program.env] || config.envs.default;
    return program.args.reduce((queue, curr) => {
        if (!config.requests[curr]) {
            console.warn(chalk.white(`info: request \"${curr}\" not found in request.yml. Skipping.`));
            return queue;
        };
        queue.push(new Request(curr, config.requests[curr], { env: env, query: program.query }));
        return queue;
    }, []);
}

function processResponse(program, resp) {
    if (resp.headers.get('content-type') === 'application/json') {
        return resp.json().then((json) => {
            printer.print(program, resp, json); 
        });
    }
    return resp.text().then((text) => {
        printer.print(program, resp, text);
    });
}
