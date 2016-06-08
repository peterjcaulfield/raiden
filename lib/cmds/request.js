var config = require('../config').getConfig(),
    helpers = require('../helpers'),
    fetch = require('../fetch'),
    chalk = require('chalk'),
    qs = require('qs'),
    Promise = require('es6-promise').Promise;

//TODO handle case sensitivity in yml keys
//TODO handle missing yml keys/values
//TODO pass in config as arg to exec from commmand?
module.exports = {
    exec: (program) => {
        var requestsQueue = createRequestQueue(program, config);
        console.log(requestsQueue);
        executeRequests(program, requestsQueue).then(() => console.log('done'));
    }
}

function executeRequests(program, queue) {
    if  (program.async) {
        return executeRequestsAsync(queue);
    } else {
        return executeRequestsSync(queue);
    }
}

function executeRequestsSync(queue) {
    return queue.reduce((sequence, request) => {
        return sequence.then(() => {
            return fetch(request);
        }).then((res) =>{
            processResponse(res);
        }).catch((e) =>{
            console.log(e);
        });
    }, Promise.resolve());
}

function executeRequestsAsync(queue) {
   return queue.reduce((prev, request) => {
        return fetch(request).then((res) => {
            processResponse(res);
        }).catch((e) =>{
            console.log(e);
        });
    }, null);
}

function createRequestQueue(program, config) {
    var env = config.envs[program.env] || config.envs.default;
    return program.args.reduce((queue, curr) => {
        if (!config.requests[curr]) {
            console.warn(chalk.red(`request : ${curr} not found in request.yml. Skipping.`));
            return queue;
        };
        queue.push(createRequest(program, env, curr, config.requests[curr]));
        return queue;
    }, []);
}

function createRequest(program, env, request, requestConfig) {
    var requestConfig = Object.assign({}, {
        protocol: '',
        method: '',
        endpoint: '',
        query: '',
        headers: {},
        body: ''
    }, requestConfig);

    var r = {};
    r.protocol = requestConfig.protocol || 'http:';
    r.host = env.split(':')[0];
    r.port = env.split(':')[1] || '80';
    r.method = requestConfig.method || 'GET';
    r.path = getPath(requestConfig, program.query);
    r.body = getRequestBody(request, requestConfig);
    r.headers = getHeaders(env, requestConfig, request.body);
    return r;
}

function getRequestBody(request, r) {
    // TODO file uploads, sanity checks
    var body = r.body,
        contentType = helpers.getPropSafely(r.headers, 'Content-Type');

    if (contentType === 'application/json') {
        body = JSON.stringify(r.body);
    } else if (contentType === 'application/x-www-form-urlencoded') {
        body = qs.stringify(r.body);
    } else if (contentType === 'multipart/form-data' || helpers.isFilePath(r.body)) {
        // we handle just need the file path to handle this in the request
        body = getAbsoluteFilePath(r.body);
    } else if (typeof r.body === 'object') {
      //TODO create error constants
      console.log(chalk.bold.red(`Error in ${request} request: A Content-Type header is required if request body is an object:`));
      console.log(chalk.red(`${JSON.stringify(r, null, 4)}`));
      process.exit(1);
    }
    return body;
}

function getAbsoluteFilePath(path) {
    return `${process.env.HOME}/.axp/${path}`;
}

function getPath(r, q) {
    var path = r.endpoint ? '' + r.endpoint : '/';
    path = `${path}${r.query ? '?' + r.query : ''}`
    path = `${path}${q ? (path.indexOf('?') > -1) ? '&' + q : '?' + q : ''}`
    return path;
}

function getHeaders(env, r, body) {
    return Object.assign(
        (body ? { 'Content-Length' : Buffer.byteLength(body) } : {}),
        r.headers || {},
        getCookies(env, r)
    );

}

function getCookies(env, r) {
    //TODO implement cookie jar
    return { 'Cookie': 'foo=bar;baz=qux'};
}

function processResponse(r) {
    if (r.headers['content-type'] === 'application/json') {
        r.data = helpers.parseJson(r.data);
    }
    console.log(r);
}

