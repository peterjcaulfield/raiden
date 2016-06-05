var config = require('../config').getConfig(),
    fetch = require('../fetch'),
    chalk = require('chalk'),
    Promise = require('es6-promise').Promise;

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

function createRequestQueue(program, config) {
    var env = config.envs[program.env] || config.envs.default;
    return program.args.reduce((queue, curr) => {
        if (!config.requests[curr]) {
            console.warn(chalk.red(`request : ${curr} not found in request.yml. Skipping.`));
            return queue;   
        };
        queue.push(createRequest(program, env, config.requests[curr]));
        return queue;
    }, []);
}

function createRequest(program, env, requestSchema) {
    var request = {};
    request.protocol = requestSchema.protocol || 'http:';
    request.host = env.split(':')[0];
    request.port = env.split(':')[1] || '80';
    request.method = requestSchema.method;
    request.path = getPath(requestSchema, program.query); 
    request.headers = getHeaders(env, requestSchema);
    return request;
}

function getPath(r, q) {
    var path = `/${r.endpoint}`;
    path = `${path}${r.query ? '?' + r.query : ''}`  
    path = `${path}${q ? (path.indexOf('?') > -1) ? '&' + q : '?' + q : ''}` 
    return path;
}

function getHeaders(env, r) {
   return Object.assign({}, r.headers, getCookies(env, r));
}

function getCookies(env, r) {
    return { Cookie: 'foo=bar;baz=qux'};
}

function executeRequestsAsync(requests) {}

function processResponse(r) {
    if (r.headers['content-type'] === 'application/json') { 
        r.body = parseJsonResponse(r.body);
    }
    console.log(r);
}

function parseJsonResponse(j) {
    var parsed = {};
    try {
        parsed = JSON.parse(j);
    } catch(e) {
        console.warn(e);    
    }
    return parsed;
}

