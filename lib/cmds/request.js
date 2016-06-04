var config = require('../config').getConfig(),
    fetch = require('../fetch'),
    chalk = require('chalk');
//TODO pass in config as arg to exec from commmand?
module.exports = {
    exec: (program) => {
        var requestsQueue = createRequestQueue(program, config);
        console.log(requestsQueue);
        fetch('http://localhost:8000/example');
    }
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
    request.host = env;
    request.path = getPath(requestSchema, program.query); 
    request.headers = requestSchema.headers;
    request.cookies = getCookies(env, requestSchema);
    return request;
}

function getPath(r, q) {
    var path = `/${r.endpoint}`;
    path = `${path}${r.query ? '?' + r.query : ''}`  
    path = `${path}${q ? (path.indexOf('?') > -1) ? '&' + q : '?' + q : ''}` 
    return path;
}

function getCookies(env, request) {
    return { foo: 'bar', baz: 'qux' };
}

function executeRequestsAsync(requests) {}
function executeRequestsSync(requests) {}
